import { Router } from 'express';
import invoiceRouter from './invoice.routes'


const routes = Router();

routes.use('/invoice', invoiceRouter);



export default routes;