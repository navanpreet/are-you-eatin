'use strict';

const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

let MessageSchema = new MONGOOSE.Schema({ 
	sender_id: { 
		type: Schema.Types.ObjectId,
		ref: 'User' 
	},
	message: {
		type: String,
		lowercase: true
	},
	time_stamp: {
		type: Number
	},
	receiver_id: {
		type: Schema.Types.ObjectId,
		ref: 'User' 
	},
	read: {
		type: Boolean
	},
	date: {
		type: String
	}
});

let Message = MONGOOSE.model('Message', MessageSchema);

module.exports = Message;