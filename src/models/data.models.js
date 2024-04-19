import {Schema, model} from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';


const invoiceData = new Schema({
	fecha: {
		type: String, 
		required: true,
	},
	descripcion:{
		type: String, 
		required: true
	},
	debe:{
		type: Number, 
		required: true,
		trim: true
	},
	haber:{
		type: Number, 
		required: true,
		trim: true
	},
	saldo:{
		type: Number,
		required: true,
	},
	concepto: {
		type: String,
		required: true
	}
},{
	versionKey:false,
	timestamps:true
});

// invoiceData.plugin(mongoosePaginate);
export default model('invoice_data',invoiceData);