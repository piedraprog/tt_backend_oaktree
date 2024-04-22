import { models } from "../models";
import { libs } from "../libs";
import multer from "multer";
import path from "path";
import xlsx from "xlsx";

// Configurar Multer para guardar archivos en una carpeta específica
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "uploads/")); // Carpeta donde se guardarán los archivos, relativa al directorio del script
  },
  filename: function (req, file, cb) {
    // Generar un nombre de archivo único
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });
const uploadMiddleware = upload.single("file");
//UPLOAD THE ARCHIVE
export const uploadData = async (req, res) => {
  uploadMiddleware(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      // Ocurrió un error de Multer al procesar la carga de archivos
      return res.status(500).send(err);
    } else if (err) {
      // Ocurrió un error desconocido
      return res.status(500).send(err);
    }

    // Devolver la ruta donde se ha almacenado el archivo
    const filePath = req.file.path;
    const transformedPath = filePath.replace(/\\/g, "/");

    try {
      const data = procesarDatosExcel(transformedPath);

      const result = await models.invoiceData.insertMany(data);

      res.status(200).send({
        code: 200,
        data: {
          message: "Archivo Excel subido correctamente.",
          url: result,
        },
      });
    } catch (error) {
      res.status(400).send({
        code: 400,
        data: {
          message: "Error.",
          url: error,
        },
      });
    }
  });
};

const procesarDatosExcel = (filePath) => {
  // Cargar el archivo Excel
  const workbook = xlsx.readFile(filePath);

  // Obtener la primera hoja del libro de trabajo
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convertir los datos de la hoja a formato JSON
  const jsonData = xlsx.utils.sheet_to_json(sheet);

  // Inicializar contadores para cada concepto de pago
  //   let contadorMantenimiento = 0;
  //   let contadorRetiro = 0;
  //   let contadorInstalacion = 0;
  //   let contadorOtro = 0;

  return jsonData.map((row) => {
    let concepto = "";
    const debe = parseFloat(row["Debe"]);

    if (!row["Descripción"]) {
      row["Descripción"] = "Sin Nombre";
      // throw new Error(`El campo "Descripción" es requerido en la fila ${index + 1}.`);
    }

    if (debe === 0.01) {
      concepto = "Mantenimiento";
      // contadorMantenimiento++;
    } else if (debe === 0.02) {
      concepto = "Retiro";
      // contadorRetiro++;
    } else if (debe === 0.11) {
      concepto = "Instalación";
      // contadorInstalacion++;
    } else {
      concepto = "Otro";
      // contadorOtro++;
    }

    return {
      fecha: row["Fecha"],
      descripcion: row["Descripción"],
      debe: row["Debe"],
      haber: row["Haber"],
      saldo: row["Saldo"],
      concepto: concepto,
    };
  });
};

export const generateInvoice = async (req, res) => {
  // Aquí generas la factura digital con los datos procesados
  // Puedes utilizar un motor de plantillas como Handlebars o generar HTML directamente
  // Retorna el contenido de la factura en formato HTML o PDF

  try {
    const facturaData = await models.invoiceData.aggregate([
      {
        $group: {
          _id: "$concepto",
          numeroItems: { $sum: 1 },
          totalSaldo: { $sum: "$saldo" },
        },
      },
      {
        $group: {
          _id: null,
          totalItems: { $sum: "$numeroItems" },
          totalSaldo: { $sum: "$totalSaldo" },
          cuentas: {
            $push: {
              concepto: "$_id",
              numeroItems: "$numeroItems",
              totalSaldo: "$totalSaldo",
            },
          },
        },
      },
    ]);

    if(facturaData.length === 0) {
        return res.status(200).send({
            code: 200,
            message: "No se encontró data",
            data: []
        })
    }
    return res.status(200).send({
      code: 200,
      data: facturaData,
    });
  } catch (error) {
    console.error("Error al obtener el resumen de la factura:", error);

    return res.status(400).send({
      code: 400,
      data: error,
    });
  }
};

export const saveInvoices = async (req, res) => {
  if (!req.body.totalItems)
    return res.status(400).send({ message: "DATA IS MISSING" });

  const { fecha, totalItems, totalSaldo, cuentas } = req.body;

  try {
    const newInvoice = new models.invoices({
      fecha,
      totalItems,
      totalSaldo,
      cuentas,
    });

    await models.invoiceData.deleteMany({});
    const momentSaved = await models.invoices.create(newInvoice);
    res.json({
      code: 200,
      result: momentSaved,
    });
  } catch (error) {
    libs.logger.error(error);
    res.status(500).json({
      message: "Error trying to save",
      error: error.message,
    });
  }
};

export const getInvoices = async (req, res) => {
  try {
    const { size, page } =  req.query;
    const { limit, offset } = libs.getPagination(size, page);

    const showInvoices = await models.invoices.paginate({},{ offset, limit });

    res.status(200).json({
      info: {
        totalItems: showInvoices.totalDocs,
        totalPages: showInvoices.totalPages,
        currentPage: showInvoices.page - 1,
      },
      results: showInvoices.docs
    });
  } catch (error) {
    libs.logger.error(error);
    res.status(500).json({
      message: error.message,
    });
  }
};
