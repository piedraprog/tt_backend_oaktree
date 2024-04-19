import {Router} from 'express';
import { controllers } from '../controllers';

const invoiceRouter = Router();


invoiceRouter.post('/upload', controllers.dataController.uploadData);


invoiceRouter.get('/generate', controllers.dataController.generateInvoice);


invoiceRouter.post('/save', controllers.dataController.saveInvoices);

invoiceRouter.get('/invoices', controllers.dataController.getInvoices);



export default invoiceRouter;