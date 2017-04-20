'use strict';

const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

let NoteSchema = new MONGOOSE.Schema({ 
	note: { 
		type: String, 
		lowercase: true,
		default: ""
	},
	patient_id: {
		type: Schema.Types.ObjectId
	},
	pill_id: {
		type: Schema.Types.ObjectId
	} 
});

let Note = MONGOOSE.model('Note', NoteSchema);

module.exports = Note;