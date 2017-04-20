'use strict';

const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

let PrescriptionSchema = new MONGOOSE.Schema({ 
	patient_id: { 
		type: Schema.Types.ObjectId, 
		lowercase: true
	}, 
	pills_id: [ 
		{ 
			type: Schema.Types.ObjectId, 
			ref: 'Pill'
		}
	],
	created: {
		type: String
	},
});

let Prescription = MONGOOSE.model('Prescription', PrescriptionSchema);

module.exports = Prescription;