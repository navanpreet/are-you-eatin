'use strict';

const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

let patientSchema = new MONGOOSE.Schema({
	_id: {
		type: Schema.Types.ObjectId
	},
	information: [{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}],
	allergies: {
		type: String,
		default: ""
	},
	current_diet_id: {
		type: Schema.Types.ObjectId
	},
	current_prescription_id: {
		type: Schema.Types.ObjectId
	},
	doctor: { 
		type: Schema.Types.ObjectId,
		ref: 'User'
	}
});

let Patient = MONGOOSE.model('Patient', patientSchema);

module.exports = Patient;