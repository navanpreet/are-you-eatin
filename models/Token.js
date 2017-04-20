'use strict';

const MONGOOSE = require('mongoose');

let tokenSchema = new MONGOOSE.Schema({ 
	token: 
		{ 
			type: String,
			required: true
		},
	key:
		{
			type: String
		},
	expires:
		{
			type: String,
			required: true
		}	
});

let Token = MONGOOSE.model('Token', tokenSchema);

module.exports = Token;