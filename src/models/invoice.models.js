import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const invoices = new Schema(
  {
    fecha:{
      type: Date,
      required: true
    },
    totalItems: {
      type: Number,
      required: true,
    },
    totalSaldo: {
      type: Number,
      required: true,
    },
    cuentas: [
      {
        concepto: {
          type: String,
          required: true,
        },
        numeroItems: {
          type: Number,
          required: true,
        },
        totalSaldo: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

invoices.plugin(mongoosePaginate);
export default model("invoice", invoices);
