'use strict';

const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

let resetSchema = new MONGOOSE.Schema({ 
	token: 
		{ 
			type: String,
			required: true
		},
	user_id:
		{
			type: Schema.Types.ObjectId
		},
	expires:
		{
			type: String,
			required: true
		}	
});

let Reset = MONGOOSE.model('Reset', resetSchema);

module.exports = Reset;