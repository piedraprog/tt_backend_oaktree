//CONFIG OF SERVER
import express from 'express';
import {middlewares} from './middlewares';
import cors from 'cors';
import routes  from './routes';
import config from './config';

const app = express();

//SETTINGS
app.set('port', config.port);

//MIDDLEWARE
const corsOptions = {};
app.use(cors(corsOptions));

app.use(middlewares.morganMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


//GENERAL
app.get('/', (req, res) => {
	res.redirect('/api');
});

app.get('/api', (req, res) => {
	res.status(200).json({
		message: "funciona"
	});
});


// FUNCTIONAL ROUTES
app.use('/api', routes);

app.use((req, res) => {
	res.status(404).json({ error: 'URL no encontrada q' });
});


export default app;
