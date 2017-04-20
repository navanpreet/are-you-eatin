'use strict'
let Doctor = require("../models/Doctor");
let User = require("../models/User");
let _ = require("lodash");
let MONGOOSE = require('mongoose');
require("../models/User");

module.exports.createDoctor = function*(data){

	//create a doctor. Use name and email

	let ctx = data;
	let body = ctx.request.body;
	let doctor = new Doctor(body);
	doctor._id = ctx.state;
	doctor.information = ctx.state;

	let result = yield doctor.save();

	if(_.isEmpty(result))
		return 500;
	else
		return 200;
};

module.exports.getDoctorFromId = function*(){

	let ctx = this;
	let doctorId = MONGOOSE.Types.ObjectId(ctx.params.ID);

	let result = yield Doctor.findById(doctorId)
							.populate('information', 'email username first_name last_name date_of_birth -_id');

	if(_.isEmpty(result))
		return yield ctx.respond(404, result, "Not found");
	else
		return yield ctx.respond(true, 200, result);
};

module.exports.getDoctorFromName = function*(){
	
	//TODO

	/*
	let ctx = this;
	let User = decodeURI(ctx.query.name);

	let result = yield Doctor.findOne({"name": doctorName});

	if(_.isEmpty(result))
		return yield ctx.respond(404, result, "Not found");
	else
		return yield ctx.respond(true, 200, result);
	*/
};

module.exports.deleteDoctor = function*(){

	let ctx = this;
	if(!checkIdSanity(ctx.params.ID)){
		return yield ctx.respond(400, ctx.params.ID, "Invalid Id type");
	}
	let doctorId = MONGOOSE.Types.ObjectId(ctx.params.ID);
	
	let result = yield Doctor.findByIdAndRemove(doctorId);
	
	if(_.isEmpty(result))
		return yield ctx.respond(404, result, "Not found");
	else
		return yield ctx.respond(true, 200, result);

};

module.exports.updateDoctor = function*(){

	let ctx = this;
	if(!checkIdSanity(ctx.params.ID)){
		return yield ctx.respond(400, ctx.params.ID, "Invalid Id type");
	}
	let doctorId = MONGOOSE.Types.ObjectId(ctx.params.ID);
	let body = ctx.request.body;
	
	let result = yield User.findByIdAndUpdate(doctorId, body);

	if(_.isEmpty(result))
		return yield ctx.respond(404, result, "Not found");
	else
		return yield ctx.respond(true, 200, result);

};
