'use strict';

const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

let verification_tokenSchema = new MONGOOSE.Schema({ 
	user_id: {
		type: Schema.Types.ObjectId
	},
	verification_token: {
		type: String
	},
	expires: {
		type: String
	},
	string_to_be_matched: {
		type: Number
	}	
});

let Verification_Token = MONGOOSE.model('Verification_Token', verification_tokenSchema);

module.exports = Verification_Token;