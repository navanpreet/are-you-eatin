'use strict'
let Patient = require("../models/Patient");
let Diet = require("../models/Diet");
let Prescription = require("../models/Prescription");
let MONGOOSE = require('mongoose');
let genit = require('genit');
let moment = require('moment');
let _ = require("lodash");

module.exports.createPatient = function*(data){

		let ctx = data;
	try{
		let body = ctx.request.body;
		let patient = new Patient();

		patient._id = ctx.state;
		patient.information = ctx.state;
		patient.allergies = body.allergies;
		patient.doctor = null;
		patient.current_diet_id = null;
		let res = yield patient.save();

		//create a new diet for a new patient
		let diet = new Diet();
		diet.patient_id = res._id;
		diet.foods_id = [];
		let newDiet = yield diet.save();

		//creates a new prescription for a new patient
		let prescription = new Prescription();
		prescription.patient_id = res._id;
		prescription.pills_id = [];
		prescription.created = moment.unix().format("MM-DD-YYYY");
		let newPrescription = yield prescription.save();

		let assignId = yield Patient.findOne({"_id": res._id});
		if(_.isEmpty(assignId)){
			return 404;
		}
		assignId.current_diet_id = newDiet._id;
		assignId.current_prescription_id = newPrescription._id;
		let result = yield assignId.save();
		
		if(_.isEmpty(result))
			return 500;
		else
			return 200;
	}catch(err){
		return err;
	}	
};


module.exports.getDoctor = function*(){
	
	let ctx = this;
	let ID = MONGOOSE.Types.ObjectId(ctx.params.ID);

	let result = yield Patient.find({"doctor": ID})
								.populate("information", "username first_name last_name email date_of_birth -_id");

	if(_.isEmpty(result))
		return yield ctx.respond(404, result, "Not found");
	else
		return yield ctx.respond(true, 200, result);
};


module.exports.getPatient = function*(){
	
	let ctx = this;
	let ID = MONGOOSE.Types.ObjectId(ctx.params.ID);
	let result = yield Patient.findById(ID)
								.populate("information", "username first_name last_name email date_of_birth -_id")
								.populate("doctor", "first_name last_name");
	
	if(_.isEmpty(result))
		return yield ctx.respond(404, result, "Not found");
	else
		return yield ctx.respond(true, 200, result);
};

module.exports.updatePatient = function*(){

	let ctx = this;
	let patientId = MONGOOSE.Types.ObjectId(ctx.params.ID);
	let body = ctx.request.body;

	let result = yield User.findByIdAndUpdate(patientId, body); 

	if(_.isEmpty(result))
		return yield ctx.respond(404, result, "Not found");
	else
		return yield ctx.respond(true, 200, result);
};

module.exports.deletePatient = function*(){

	let ctx = this;
	let patientId = MONGOOSE.Types.ObjectId(ctx.params.ID);

	let result = yield Patient.findByIdAndRemove(patientId); 

	if(_.isEmpty(result))
		return yield ctx.respond(404, result, "Not found");
	else
		return yield ctx.respond(true, 200, result);

};