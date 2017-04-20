'use strict'
let _ = require("lodash");
let Prescription = require("../models/Prescription");
let Diet = require("../models/Diet");
const MONGOOSE = require('mongoose');
let Patient = require("../models/Patient");
let Note = require("../models/Note");


module.exports.getDietAndPrescription = function*(){

	//fetches a prescription and diet with patient_id as a parameter. Requested by the front end.

	let ctx = this;
	let patientId = MONGOOSE.Types.ObjectId(ctx.params.patient_id);

	let patientDocument = yield Patient.findById(patientId);

	if(_.isEmpty(patientDocument)){
		return yield ctx.respond(404, {}, "Patient not found");
	}

	let prescriptionDocument = yield Prescription.findById(patientDocument.current_prescription_id)
													.populate("pills_id");

	let dietDocument = yield Diet.findById(patientDocument.current_diet_id)
									.populate("foods_id"); 

	if(_.isEmpty(prescriptionDocument)){
		return yield ctx.respond(404, {}, "Prescription not found");	
	}

	if(_.isEmpty(dietDocument)){
		return yield ctx.respond(404, dietDocument, "Diet not found");	
	}

	let patientNotes = yield Note.find({"patient_id": patientId});

	let prescriptionResult = addNotes(prescriptionDocument, patientNotes);	

	let newResponse = {
		prescription_id: "",
		diet_id: "",
		diet_created: "",
		prescription_created: "",
		pills_id: [],
		foods_id: []
	}
	newResponse.prescription_id = prescriptionResult._id;
	newResponse.diet_id = dietDocument._id;
	newResponse.diet_created = dietDocument.created;
	newResponse.prescription_created = prescriptionResult.created;
	newResponse.pills_id = prescriptionResult.pills_id;
	newResponse.foods_id = dietDocument.foods_id;

	return yield ctx.respond(true, 200, newResponse);
			
};

function addNotes(result, patientNotes){
	
	let newDoc = {
		_id: "",
		created: "",
		pills_id: [
		]
	};
	

	newDoc._id = result._id;
	newDoc.created = result.created;
	_.each(result.pills_id, function(value){
		let newVal = {_id: "", name: "", note: ""};

		newVal._id = value._id;
		newVal.name = value.name;
		newDoc.pills_id.push(newVal);
	});
	console.log("nd", newDoc);
	console.log("pn", patientNotes);
	_.forEach(newDoc.pills_id, function(eachPill){
		_.forEach(patientNotes, function(eachNote){
			console.log("note is", eachNote);
			if(eachPill._id.toString() === eachNote.pill_id.toString()){
				eachPill.note = eachNote.note;
			}
		})
	})
	return newDoc;
}