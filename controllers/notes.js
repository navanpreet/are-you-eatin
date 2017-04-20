'use strict'
let Note = require('../models/Note');
let MONGOOSE = require('mongoose');
let _ = require('lodash');
let Pill = require('../models/Pill');

module.exports.createNote = function*(){

	let ctx = this;
	let body = ctx.request.body;

	let pill_name = body.pill_name;

	let pillDoc = yield Pill.findOne({"name": pill_name});
	
	if(_.isEmpty(pillDoc)){
		let pill = new Pill({"name": pill_name});
		pillDoc = yield pill.save();
	}

	let note = new Note();
	note.pill_id = pillDoc._id;
	note.note = body.note;
	note.patient_id = body.patient_id;

	try{
		let result = yield note.save();
		if(_.isEmpty(result))
			return yield ctx.respond(500, result, "Creation failed");
		else
			return yield ctx.respond(true, 200, result);
	}catch(err){
		return yield ctx.respond(500, err, err);
	}
}

module.exports.getAllNotesForAPatient = function*(){

	let ctx = this;
	let patientId = ctx.params.patient_id;

	let result = yield Note.find({"patient_id": patientId});

	if(_.isEmpty(result))
		return yield ctx.respond(404, result, "No notes exist");
	else
		return yield ctx.respond(true, 200, result);	
}

module.exports.getANoteByPillAndPatientId = function*(){

	let ctx = this;
	let patientId = ctx.params.patient_id;
	let pillName  = ctx.params.pill_name;

	let pillDoc = yield Pill.findOne({"name": pill_name});
	if(_.isEmpty(pillDoc)){
		return yield ctx.respond(404, pillDoc, "note not found");
	}
	let result = yield Note.findOne({"patient_id": patientId, "pill_id": pillDoc._id});

	if(_.isEmpty(result))
		return yield ctx.respond(404, result, "Note not found");
	else
		return yield ctx.respond(true, 200, result);		
}

module.exports.updateNote = function*(){

	let ctx = this;
	let noteId = ctx.params.note_id;
	let newNote = ctx.request.body.note;

	
	let result = yield Note.findById(noteId);
	
	if(_.isEmpty(result)){
		ctx.respond(404, result, "Note not found");
	}
	else{
		result.note = newNote;
		let updatedRecord = result.save();

		if(_.isEmpty(updatedRecord))
			return yield ctx.respond(500, updatedRecord, "Could not update");
		else
			return yield ctx.respond(true, 200, updatedRecord);	
	}
}

module.exports.deleteNote = function*(){
	
	let ctx = this;
	let noteId = ctx.params.note_id;
	
	let result = yield Note.FindByIdAndRemove(noteId);	
	
	if(_.isEmpty(result))
		return yield ctx.respond(404, result, "Note not found");
	else
		return yield ctx.respond(true, 200, "note deleted");

}
