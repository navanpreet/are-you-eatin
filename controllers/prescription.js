'use strict'

let Prescription = require("../models/Prescription");
let Pill = require("../models/Pill");
let Patient = require("../models/Patient");
let moment = require("moment");
let MONGOOSE = require("mongoose");
let genit = require("genit");
let _ = require("lodash");
let Note = require("../models/Note");

module.exports.createPrescription = function*(){

	//creates a new prescription for a given patient_id

	let ctx = this;
	let patientId = MONGOOSE.Types.ObjectId(ctx.params.patient_id);
	let timeStamp = ctx.params.time_stamp;
	let createdOn = moment.unix(timeStamp).format('MM-DD-YYYY');
	let prescription = new Prescription();
	prescription.patient_id = patientId;
	prescription.pills_id = [];
	prescription.created = createdOn;

	let result = yield prescription.save();

	
	if(_.isEmpty(result))
		return yield ctx.respond(400, result, "Not created");
	else
		return yield ctx.respond(true, 200, result);

};

function addNotes(result, patientNotes){

	_.forEach(result.pills_id, function(eachPill){
		_.forEach(patientNotes, function(eachNote){
			if(eachPill._id.toString() === eachNote.pill_id.toString()){
				eachPill.note = eachNote._id;
			}
		})
	})
}

module.exports.getPrescription = function*(){

	//fetches a prescription with prescription_id as a parameter

	let ctx = this;
	let prescriptionId = MONGOOSE.Types.ObjectId(ctx.params.prescription_id);

	let result = yield Prescription
						.findOne({"_id": prescriptionId})
						.populate("pills_id");

	let patientNotes = yield Note.find({"patient_id": result.patient_id});

	result = addNotes(result, patientNotes);

	let resultWithNote = yield result.save();
	
	if(_.isEmpty(resultWithNote))
		return yield ctx.respond(400, resultWithNote, "Not created");
	else
		return yield ctx.respond(true, 200, resultWithNote);
			
};

module.exports.getAllPrescriptionsForAPatient = function*(){

	let ctx = this;
	let patientId = MONGOOSE.Types.ObjectId(ctx.params.patient_id);

	let prescriptionDocument = yield Prescription.find({"patient_id": patientId})
													.populate("pills_id");

	let newDoc = [];
	let oneDate = prescriptionDocument.created;
	
	// _.each(prescriptionDocument, function(val){
	// 	let doc = {};
	// 	if(val.created == oneDate){
	// 		doc = val;		
	// 	}
	// 	else{
	// 		newDoc.push(doc);
	// 		oneDate = val.created;
	// 	}
	// })
	// console.log("m",newDoc);

	if(_.isEmpty(prescriptionDocument)){
		return yield ctx.respond(400, prescriptionDocument, "Not found");
	}
	
	return yield ctx.respond(newDoc);

};

module.exports.getPrescriptionByTheDateOfCreation = function*(){

	//fetches a prescription with prescription_id as a parameter

	let ctx = this;
	let patientId = MONGOOSE.Types.ObjectId(ctx.params.patient_id);
	let timeStamp = ctx.params.time_stamp;
	let date = moment.unix(timeStamp).format("MM-DD-YYYY");

	let result = yield Prescription
					.findOne({"patient_id": patientId, "created": date})
					.populate("pills_id");

	result = addNotes(result, patientNotes);					

	let resultWithNote = yield result.save();

	if(_.isEmpty(resultWithNote))
		return yield ctx.respond(400, resultWithNote, "Not created");
	else
		return yield ctx.respond(true, 200, resultWithNote);
			
};


module.exports.addPillToPrescription = function*(){

	let ctx = this;
	let body = ctx.request.body;
	let patientId = MONGOOSE.Types.ObjectId(ctx.params.patient_id);
	let patientDocument = yield Patient.findById(patientId);
	let requestSanityFlag = true;
	
	_.forEach(body.pill, function(val, key){
		if(val['pill_name'] == undefined){
			requestSanityFlag = false;
		}
	})

	if(requestSanityFlag == false){
		return yield ctx.respond(400, null, "Request not in proper format. Please check the documents.");
	}

	if(_.isEmpty(patientDocument)){
		return yield ctx.respond(404, patientDocument, "Patient not found");
	}

	let currentPrescriptionOfPatientId = patientDocument.current_prescription_id;

	let prescriptionDocument = yield Prescription.findById(currentPrescriptionOfPatientId);
	if(_.isEmpty(prescriptionDocument)){
		return yield ctx.respond(404, prescriptionDocument, "Prescription not found");
	}
	let comparisonCopyOfPrescription = yield Prescription.findById(currentPrescriptionOfPatientId);
	

	let createdOn = moment.unix(body.time_stamp).format('MM-DD-YYYY');

	yield genit.each(body.pill, function*(val){

		let pillDocument = yield Pill.findOne({"name": val.pill_name.toLowerCase()});
		let createdPillId;

		if(_.isEmpty(pillDocument)){
			let pill = new Pill();
			pill.name = val.pill_name;
			let savedPill = yield pill.save();

			if(_.isEmpty(savedPill)){
				return yield ctx.respond(500, savedPill, "Not created");
			}
			else{
				createdPillId = savedPill._id;
			}
		}
		else{
			createdPillId = pillDocument._id;
		}
		
		let note = new Note();
		note.pill_id = createdPillId;
		note.patient_id = patientId;
		note.note = val.note;
		yield note.save();
		if(!prescriptionDocument.pills_id){
			prescriptionDocument.pills_id = new Array();
		}
		else{
			if(!_.includes(prescriptionDocument.pills_id.toString(), createdPillId.toString())){
				prescriptionDocument.pills_id.push(MONGOOSE.Types.ObjectId(createdPillId));
			}
		}
	})

	try{
		if(!_.isEqual(comparisonCopyOfPrescription.pills_id, prescriptionDocument.pills_id)){

			let newPrescription = new Prescription();
			// create new prescription and copy everything except id
			newPrescription.created = createdOn;
			newPrescription.patient_id = prescriptionDocument.patient_id;
			newPrescription.pills_id = prescriptionDocument.pills_id;
			var updatedPrescription = yield newPrescription.save();
			console.log("up",updatedPrescription);
			patientDocument.current_prescription_id = updatedPrescription._id;

			//save new diet id to patient document
			let r = yield patientDocument.save();

			return yield ctx.respond(true, 200, updatedPrescription);
		}
	}
	catch(err){
		return yield ctx.respond(500, err, "Could not add");
	}
	return yield ctx.respond(false, 400, prescriptionDocument, "no change in the diet");

};

module.exports.removePillFromPrescription = function*(){

	let ctx = this;
	let patientId = MONGOOSE.Types.ObjectId(ctx.params.patient_id);
	let body = ctx.request.body;
	let requestSanityFlag = true;

	_.forEach(body.food, function(val){
		if(val['pill_name'] == undefined){
			requestSanityFlag = false;
		}
	})

	if(requestSanityFlag == false){
		return yield ctx.respond(400, null, "Request not in proper format. Please check the documents.");
	}
	yield genit.each(body.pill, function*(val){
		let name = val['pill_name'];
		let createdOn = moment.unix(ctx.request.body.time_stamp).format('MM-DD-YYYY');
		let data = new Prescription();

		let pillId = yield Pill.findOne({"name": name.toLowerCase()});  

		if(_.isEmpty(pillId)){
			return yield ctx.respond(400, pillId, "Pill not found");
		}
		else {
			let patientDetails = yield Patient.findOne({"_id": patientId});
			let result = yield Prescription.findOne({"_id": patientDetails.current_prescription_id});

			if(_.isEmpty(result.pills_id)){
				return yield ctx.respond(400, result, "Prescription is empty");
			}
			
			result.pills_id.pull (
				MONGOOSE.Types.ObjectId(pillId._id)
			);

			data.patient_id = MONGOOSE.Types.ObjectId(result.patient_id);
			data.created = createdOn;
			data.pills_id = result.pills_id;

			let updatedPrescription = yield data.save();

			let newCurrentPrescription = yield Patient.findOne({"_id": patientId});

			newCurrentPrescription.current_prescription_id = MONGOOSE.Types.ObjectId(updatedPrescription._id);

			let output = yield newCurrentPrescription.save();

			if(_.isEmpty(updatedPrescription) || _.isEmpty(updatedPrescription)){
				return yield ctx.respond(400, output, "Deletion failed");
			}
			else
				return yield ctx.respond(true, 200, output);
		}
	});
};

module.exports.deletePrescription = function*(){
	let ctx = this;
	let prescriptionId = MONGOOSE.Types.ObjectId(ctx.params.prescription_id);

	let data = yield Prescription.find({"_id": prescriptionId});

	if(!_.isEmpty){
		let result = yield data.remove();
		if(!_.isEmpty(result))
			return yield ctx.respond(true, 200, result);
		else
			return yield ctx.respond(400, result, "Unable to delete");
	}
	else
		return yield ctx.respond(404, result, "Prescription not found");
};


					