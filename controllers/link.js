'use strict'

let Patient = require('../models/Patient');
let Match = require('../models/Match');
let MONGOOSE = require('mongoose');

let _ = require('lodash');

module.exports.generateString = function*(){

	let ctx = this;
	let randomString = Math.floor((Math.random() * 10000));
	let match = new Match();
	match.patient_id = MONGOOSE.Types.ObjectId(ctx.state.user);
	match.string_to_be_matched = randomString;
	
	try{
	let result = yield match.save();
	}catch(err){
		return yield ctx.respond(500, err, "could not save");
	}
	return yield ctx.respond(true, 200, randomString);
};

module.exports.matchString = function*(){

	let ctx = this;
	let suppliedId = ctx.params.doctor_id;
	let capturedString = ctx.request.query.q;
	
	let doctorId = ctx.state.user;
	
	if(_.isEmpty(doctorId)){
		return yield ctx.respond(500, null, "error in recovering doctor details");
	}

	if(suppliedId != doctorId.toString()){
		return yield ctx.respond(401, suppliedId, "The given id is not authorized to perform this action");
	}

	let st = yield Match.findOne({"string_to_be_matched": capturedString});

	if(_.isEmpty(st)){
		return yield ctx.respond(500, err, "could not save");
	}
	
	if(capturedString == st.string_to_be_matched){

		let record = yield Patient.findOne({"_id": MONGOOSE.Types.ObjectId(st.patient_id)});
		if(_.isEmpty(record)){
			return yield ctx.respond(404, record, "patient not found");
		}

		record.doctor = doctorId;
		
		try{
			var result = yield record.save();
		}catch(err){
			return yield ctx.respond(500, err, "could not save");
		}
		
		try{
			yield Match.findOneAndRemove({"string_to_be_matched": capturedString});
		}catch(err){
			console.log(err);
		}
		return yield ctx.respond(true, 200, result);
	}
}