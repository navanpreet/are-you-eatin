'use strict'

let Diet = require("../models/Diet");
let Food = require("../models/Food");
let Patient = require("../models/Patient");
let genit = require("genit");
let MONGOOSE = require("mongoose");
let _ = require("lodash");
let moment = require("moment");
let checkIdSanity = require("../helpers/checkIdSanity");

module.exports.createDiet = function*(){

	//creates a new diet for a given patient_id

	let ctx = this;
	let patientId = MONGOOSE.Types.ObjectId(ctx.params.patient_id);

	if(!checkIdSanity(ctx.params.patient_id)){
		return yield ctx.respond(400, ctx.params.patient_id, "Invalid Id type");
	}
	let createdOn = moment().format('MM-DD-YYYY');
	let diet = new Diet();
	diet.patient_id = patientId;
	diet.foods_id = [];

	let result = yield diet.save();
	if(_.empty(result)){
		return yield ctx.respond(500, result, "Could not save");		
	}

	return yield ctx.respond(true, 200, result);
};

module.exports.getDiet = function*(){

	//fetches the current diet for a patient with patient_id as the parameter
	
	let ctx = this;
	
	if(!checkIdSanity(ctx.params.patient_id)){
		return yield ctx.respond(400, ctx.params.patient_id, "Invalid Id type");
	}

	let patientId = MONGOOSE.Types.ObjectId(ctx.params.patient_id);

	let patientDetails = yield Patient.findOne({"_id": patientId});
	if(_.isEmpty(patientDetails)){
		return yield ctx.respond(404, patientDetails, "Patient not found");	
	}
	let dietId = patientDetails.current_diet_id;

	try{
		let result = yield Diet
						.findOne({"_id": dietId})
						.populate("foods_id");
		if(_.isEmpty(result)){
			return yield ctx.respond(404, result, "Diet not found");	
		}				
		return yield ctx.respond(true, 200, result);
		
	}catch(err){
		return yield ctx.respond(500, err, "Not created");
	}
		
};

module.exports.getAllDietsForAPatient = function*(){

	let ctx = this;
	let patientId = MONGOOSE.Types.ObjectId(ctx.params.patient_id);

	let dietDocument = yield Diet.find({"patient_id": patientId})
									.populate("foods_id");

	if(_.isEmpty(dietDocument)){
		return yield ctx.respond(400, dietDocument, "Not found");
	}
	
	return yield ctx.respond(dietDocument);

};

module.exports.addFoodToDiet = function*(){

	let ctx = this;
	let body = ctx.request.body;
	if(!checkIdSanity(ctx.params.patient_id)){
		return yield ctx.respond(400, ctx.params.patient_id, "Invalid Id type");
	}
	let patientId = MONGOOSE.Types.ObjectId(ctx.params.patient_id);
	let requestSanityFlag = true;
	
	_.forEach(body.food, function(val, key){
		if(val['food_name'] == undefined){
			requestSanityFlag = false;
		}
	})

	if(requestSanityFlag == false){
		return yield ctx.respond(400, null, "Request not in proper format. Please check the documents.");
	}

	let patientDocument = yield Patient.findById(patientId);
	
	if(_.isEmpty(patientDocument)){
		return yield ctx.respond(404, patientDocument, "Patient not found");
	}
		
	let currentDietOfPatientId = patientDocument.current_diet_id;

	let dietDocument = yield Diet.findById(currentDietOfPatientId);
	if(_.isEmpty(dietDocument)){
		return yield ctx.respond(404, dietDocument, "Diet not found");	
	}
	//dont want a reference to dietDocument
	let comparisonCopyOfDiet = yield Diet.findById(currentDietOfPatientId);
	
	let createdOn = moment.unix(body.time_stamp).format('MM-DD-YYYY');
	

	yield genit.each(body.food, function*(val){

		let foodDocument = yield Food.findOne({"name": val.food_name.toLowerCase()});
		let createdFoodId;

		if(_.isEmpty(foodDocument)){
			//create new food if not found
			let food = new Food();
			food.name = val.food_name;
			
			try{
				let savedFood = yield food.save();
				createdFoodId = savedFood._id;
			}catch(err){
				return yield ctx.respond(500, err, err);
			}
		}
		else{
			createdFoodId = foodDocument._id;
		}
		if(!dietDocument.foods_id){
			dietDocument.foods_id = new Array();
		}
		else{
			//add food to diet array
			if(!_.includes(dietDocument.foods_id.toString(), createdFoodId.toString())){
				dietDocument.foods_id.push(MONGOOSE.Types.ObjectId(createdFoodId));
			}
		}
	})

	try{
		if(!_.isEqual(comparisonCopyOfDiet.foods_id, dietDocument.foods_id)){
			let newDiet = new Diet();
			// create new diet and copy everything except id
			newDiet.created = createdOn;
			newDiet.patient_id = dietDocument.patient_id;
			newDiet.foods_id = dietDocument.foods_id;
		
			let updatedDiet = yield newDiet.save();
			patientDocument.current_diet_id = updatedDiet._id;

			//save new diet id to patient document
			yield patientDocument.save();
			return yield ctx.respond(true, 200, updatedDiet);

		}
	}catch(err){
		return yield ctx.respond(500, err, "Could not add");
	}

	return yield ctx.respond(false, 400, dietDocument, "no change in the diet");

};

module.exports.removeFoodFromDiet = function*(){

	//remove a food based on it's name from the diet of a patient

	let ctx = this;
	if(!checkIdSanity(ctx.params.patient_id)){
		return yield ctx.respond(400, ctx.params.patient_id, "Invalid Id type");
	}
	let patientId = MONGOOSE.Types.ObjectId(ctx.params.patient_id);
	let body = ctx.request.body;

	//Even though deletion only takes one id at a time now. Bulk deletion be useful in the future
	let requestSanityFlag = true;

	_.forEach(body.food, function(val){
		if(val['food_name'] == undefined){
			requestSanityFlag = false;
		}
	})

	if(requestSanityFlag == false){
		return yield ctx.respond(400, null, "Request not in proper format. Please check the documents.");
	}

	 yield genit.each(body.food, function*(val){
		
		let createdOn = moment.unix(ctx.request.body.time_stamp).format('MM-DD-YYYY');
		let data =  new Diet();
		let foodId = yield Food.findOne({"name": name});

		if(_.isEmpty(foodId)){
			return yield ctx.respond(400, foodId, "Food not found");
		}
		else {
			let patientDetails = yield Patient.findOne({"_id": patientId});
			if(_.isEmpty(patientDetails)){
				return yield ctx.respond(404, patientDetails, "patient not found");		
			}

			let result = yield Diet.findOne({"_id": patientDetails.current_diet_id});
			if(_.isEmpty(result)){
				return yield ctx.respond(404, patientDetails, "diet not found");			
			}

			if(_.isEmpty(result.foods_id)){
				return yield ctx.respond(400, result, "Diet is empty");
			}
			result.foods_id.pull (
				MONGOOSE.Types.ObjectId(foodId._id)
			);

			data.patient_id = MONGOOSE.Types.ObjectId(result.patient_id);
			data.created = createdOn;
			data.foods_id = result.foods_id;

			let updatedDiet = yield data.save();

			patientDetails.current_diet_id = MONGOOSE.Types.ObjectId(updatedDiet._id);

			let output = yield patientDetails.save();

			if(_.isEmpty(output) || _.isEmpty(updatedDiet)){
				return yield ctx.respond(500, output, "Deletion failed");
			}
			else{
				//send success message as the response
				return yield ctx.respond(true, 200, "Deletion successful");
			}
		}
	})	
};

module.exports.deleteDiet = function*(){

	let ctx = this;
	if(!checkIdSanity(ctx.params.ID)){
		return yield ctx.respond(400, ctx.params.ID, "Invalid Id type");
	}
	let dietId = MONGOOSE.Types.ObjectId(ctx.params.ID);

	let result = yield Diet.findByIdAndRemove(dietId);
	
	if(_.isEmpty(result))
		return yield ctx.respond(404, result, "Not found");
	else
		return yield ctx.respond(true, 200, result);

};





					