import app from './app';
import { libs } from './libs';
import'./db';


app.listen(app.get('port'));
libs.logger.info({message:`server on port, ${app.get('port')}`, file: 'index.js'}); 
