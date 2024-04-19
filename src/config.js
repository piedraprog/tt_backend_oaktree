/* eslint-disable no-undef */
import { config } from 'dotenv';
config();

export default {
	baseUrl: process.env.API_URL || 'http://localhost:3000',
	mongodbURL: process.env.MONGO_URL || 'mongodb://Localhost/invoices',
	jwtKey: process.env.JWT_PASS,
	env: process.env.npm_lifecycle_event, 
	port: process.env.PORT || 3000,
	host: process.env.HOST
};
