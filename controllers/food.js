'use strict'

let Food = require("../models/Food");
let _ = require("lodash");
let genit = require("genit");
let MONGOOSE = 	require('mongoose');

module.exports.createFood = function*(){
	
	let ctx = this;
	let body = ctx.request.body;
	let result = []
	let check;

	yield genit.each(body, function* (val){
		check = yield Food.findOne({"name": val.name});

		//wrapper string function for response

		let resultOne = {
			"_id": "string",
			"name": "string",
			"status": "string"
		};

		// if food does not exist, create a new entry

		if(_.isEmpty(check)){
			let food = new Food(val)
			food.save();
			resultOne._id = food._id;
			resultOne.name = food.name;
			resultOne.status = "success";
			result.push(resultOne);
		}
		else{
			resultOne._id = check._id;
			resultOne.name = check.name;
			resultOne.status = "Already exists";
			result.push(resultOne);
		}
	})

	if(!_.isEmpty(result))
		return yield ctx.respond(true, 200, result);
	
};

module.exports.getFood = function*(){
	
	//get all foods

	let ctx = this;

	let result = yield Food.find({});

	if(_.isEmpty(result))
		return yield ctx.respond(400, result, "Not created");
	else 
		return yield ctx.respond(true, 200, result);

};

module.exports.getFoodByName = function*(){

	//search food by name 
	
	let ctx = this;

	let name = ctx.params.name;
	
	let result = yield Food.find({"name" : name.toLowerCase()});

	if(_.isEmpty(result))
		return yield ctx.respond(false, 404, result, "Not found");		
	else
		return yield ctx.respond(result);

};

module.exports.updateFood = function*() {

	// update food

	let ctx = this;

	let id = MONGOOSE.Types.ObjectId(ctx.params.ID);
	let newName = ctx.body.name;

	let result = yield Food.findOne({"_id": id});

	if(!_.isEmpty(result)){
		result.name = newName;
		let res = result.save();
		return yield ctx.respond(true, 200, res);
	}	
	else
		return yield ctx.respond(404, result, "Food not found")

}

module.exports.deleteFood = function*() {

	// delete food

	let ctx = this;

	if(!checkIdSanity(ctx.params.ID)){
		return yield ctx.respond(400, ctx.params.ID, "Invalid Id type");
	}
	let id = MONGOOSE.Types.ObjectId(ctx.params.ID);

	let result = yield Food.remove({"_id": id});

	if(!_.isEmpty(result))
		return yield ctx.respond(true, 200, result);	
	else
		return yield ctx.respond(404, result, "Food not found")

};

module.exports.regexNameSearch = function*(){

	// autocomplete

	let ctx = this;

	let name = ctx.request.query.name.toLowerCase();

	let result = yield Food.find({"name": new RegExp(name,'i')});

	if(!_.isEmpty(result))
		return yield ctx.respond(true, 200, result);	
	else
		return yield ctx.respond(404, result, "Food not found")
};





