'use strict';

const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

let DietSchema = new MONGOOSE.Schema({ 
	patient_id: { 
		type: Schema.Types.ObjectId, 
		lowercase: true
	},
	created: {
		type: String
	}, 
	foods_id: [ 
		{ type: Schema.Types.ObjectId, 
			ref: 'Food'
		}
	] 
});

let Diet = MONGOOSE.model('Diet', DietSchema);

module.exports = Diet;
