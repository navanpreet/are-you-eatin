'use strict';

const MONGOOSE = require('mongoose');

let userSchema = new MONGOOSE.Schema({ 
	
	username: 
		{ 
			type: String, 
			unique: true,
			required: true
		},
	first_name: 
		{
			type: String,
			required: true
		},
	last_name: 
		{
			type: String,
			required: true
		},	
	date_of_birth: 
		{
			type: String,
			required: true
		},	
	email: 
		{ 
			type: String,
			unique: true,
			required: true
		}, 
	password: 
		{ 
			type: String,
			required: true
		},
	type_of_user: 
		{
			type: String,
			required: true
		},
	email_verified:
		{
			type: Boolean,
			default: false
		}

});

let User = MONGOOSE.model('User', userSchema);

module.exports = User;