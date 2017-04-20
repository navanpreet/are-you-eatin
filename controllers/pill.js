
'use strict'
let Pill = require("../models/Pill");
let _ = require("lodash");
let genit = require("genit");

module.exports.createPill = function*(){
	
	let ctx = this;
	let body = ctx.request.body;
	let result = []
	let check;
	
	yield genit.each(body, function* (val){
		check = yield Pill.findOne({"name": val.name});

		//wrapper string function for return

		let resultOne = {
			"_id": "string",
			"name": "string",
			"status": "string"
		};

		// if pill does not exist, create a new entry

		if(_.isEmpty(check)){
			let pill = new Pill(val);
			pill.save();
			resultOne._id = pill._id;
			resultOne.name = pill.name;
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

module.exports.getPill = function*(){

	//get all pills

	let ctx = this;

	let result = yield Pill.find({});

	if(_.isEmpty(result))
		return yield ctx.respond(400, result, "Not created");
	else 
		return yield ctx.respond(true, 200, result);

};

module.exports.getPillByName = function*(){

	//get pill by name

	let ctx = this;

	let name = ctx.params.name;
	
	let result = yield Pill.find({"name" : name});

	if(_.isEmpty(result))
		return yield ctx.respond(false, 400, result, "Not found");		
	else
		return yield ctx.respond(result);

};

module.exports.updatePill = function*(){

	let ctx = this;
	let pillId = MONGOOSE.Types.ObjectId(ctx.params.pill_id);
	let newName = ctx.request.body.name;


	let result = yield Pill.findOneAndUpdate({"_id": pillId}, {"message": newName});

	if(_.isEmpty(result))
		return yield ctx.respond(404, result, "Pill not found");
	else
		return yield ctx.respond(true, 200, result);

};

module.exports.deletePill = function*(){

	let ctx = this;
	let pillId = MONGOOSE.Types.ObjectId(ctx.params.pill_id);

	let data = yield Pill.findOne({"_id": pillId});

	if(_.isEmpty(data)){
		return yield ctx.respond(404, result, "Pill not found");
	}
	else{
		let result = yield data.remove();
		if(_.isEmpty(result))
			return yield ctx.respond(400, result, "Unable to delete");
		else
			return yield ctx.respond(true, 200, result);
	}
};

module.exports.regexNameSearch = function*(){

	// substring search

	let ctx = this;

	let name = ctx.request.query.name;

	let result = yield Pill.find({"name": new RegExp(name,'i')});

	if(!_.isEmpty(result))
		return yield ctx.respond(true, 200, result);	
	else
		return yield ctx.respond(false, 404, result, "Pill not found")
};





