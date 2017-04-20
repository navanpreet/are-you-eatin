'use strict';

const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

let doctorSchema = new MONGOOSE.Schema({ 
	_id: {
		type: Schema.Types.ObjectId
	}, 
	information: [{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}]
});

let Doctor = MONGOOSE.model('Doctor', doctorSchema);

module.exports = Doctor;