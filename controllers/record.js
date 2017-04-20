'use strict'

// a new record will be created for each day but not when images are added or eaten today is updated


let MONGOOSE = require('mongoose');
let Record = require('../models/Record');
let Diet = require('../models/Diet');
let Prescription = require('../models/Prescription');
let Patient = require('../models/Patient');
let genit = require('genit');
let _ = require('lodash');
let moment = require('moment');
let s3 = require('s3');
let knox = require('knox');
let fs = require('fs');
let lwip = require('lwip');
let Note = require('../models/Note');
let CONFIG = require('../config/config.json');

let client = knox.createClient({
		key: CONFIG.s3_client.key,
		secret: CONFIG.s3_client.secret,
		bucket: CONFIG.s3_client.bucket
	});

function *create(ctx, patientId, timeStamp){
	
	let patientDetails = yield Patient.findById(patientId);
	if(_.isEmpty(patientDetails)){
		return yield ctx.respond(false, 404, "patient doesn't exist");
	}
	
	let dietId = patientDetails.current_diet_id;
	
	let record = new Record();
	record.patient_id = patientId;
	record.diet_id = dietId;
	record.time_stamp = timeStamp;
	record.date = moment.unix(timeStamp).format('MM-DD-YYYY');
	record.food_history = [];
	record.images = [];
	record.image_keys = [];
	record.prescription_id = patientDetails.current_prescription_id;
	record.current_prescription = [];
	
	let diet = yield Diet
						.findOne({"_id": dietId})
						.populate("foods_id");

	let prescription = 	yield Prescription
								.findOne({'_id': record.prescription_id})
								.populate("pills_id");	

	console.log("pres is", prescription);

	if(_.isEmpty(diet)){
		return yield ctx.respond(404, "Diet not found");
	}

	_.forEach(diet.foods_id, function(value){
		record.food_history.push({
			food_id: MONGOOSE.Types.ObjectId(value._id),
			eaten_today: false
		});
	})

	_.forEach(prescription.pills_id, function(value){
		record.current_prescription.push({
			pill_id: MONGOOSE.Types.ObjectId(value._id)
		})
	})

	// let notes = yield Note.find({"patient_id": result.patient_id});


	let result = yield record.save();

	let patientNotes = yield Note.find({"patient_id": result.patient_id});
	
	let recordWithNotes = insertNotes(result, patientNotes);
	yield recordWithNotes.save();
	recordWithNotes = yield Record.findById(recordWithNotes._id)
									.populate("food_history.food_id")
									.populate("current_prescription.pill_id", "_id name")
									.populate("current_prescription.note", "note");
	
	if(_.isEmpty(recordWithNotes))
		return yield ctx.respond(400, recordWithNotes, "Not created");
	else
		return yield ctx.respond(true, 200, recordWithNotes);
		
}



function insertNotes(record, patientNotes){

	if(_.isEmpty(patientNotes)){
	 	return record;
	}
	if(_.isArray(record)){
		_.each(record, function(val){
			_.each(val.current_prescription, function(eachPill){
				_.each(patientNotes, function(eachNote){
					if(_.isArray(eachPill.pill_id)){
						if(eachPill.pill_id._id.toString() === eachNote.pill_id.toString()){
							eachPill.note = eachNote._id;
						}	
					}
					if(eachPill.pill_id.toString() === eachNote.pill_id.toString()){	
						eachPill.note = eachNote._id;
					}
				})
			})					
		})
		return record;
	}
	else{
		_.each(record.current_prescription, function(eachPill){
			_.each(patientNotes, function(eachNote){
				if(_.isArray(eachPill.pill_id)){
					if(eachPill.pill_id._id.toString() === eachNote.pill_id.toString()){
						eachPill.note = eachNote._id;
					}	
				}
				else{
					if(eachPill.pill_id.toString() === eachNote.pill_id.toString()){
						eachPill.note = eachNote._id;
					}
				}	
			})
		})
		return record;		
	}

}



module.exports.createRecord = function*(){
	let ctx = this;
	let patientId = MONGOOSE.Types.ObjectId(ctx.params.ID);
	let timeStamp = ctx.params.time_stamp;
	yield create(ctx, patientId, timeStamp);

};

function getS3Url(filename) {
	var expires = new Date();
	expires.setMinutes(expires.getMinutes() + 1440);
	return client.signedUrl(filename, expires);
}

module.exports.getRecordByDate = function*(){

	//this will create a new record if a record does not exist for the day and then return the record id
	let ctx = this;
	let patientId = MONGOOSE.Types.ObjectId(ctx.params.patient_id);
	console.log(ctx.params);

	let timeStamp = ctx.params.time_stamp;

	let date = moment.unix(timeStamp).format('MM-DD-YYYY');

	let response = yield Record
							.findOne({"patient_id": patientId, "date": date})
							.populate("food_history.food_id")
							.populate("current_prescription.pill_id")
							.populate("current_prescription.note", "note");

	if(!_.isEmpty(response)){
		//download images
		let newResponse = downloadImages(response);
		// let patientNotes = yield Note.find({"patient_id": patientId});
		// let result = insertNotes(newResponse, patientNotes);
		return yield ctx.respond(newResponse);
	}
	else{
		yield create(ctx, patientId, timeStamp);	
	}
	//return a record id which will be used to update eaten todays
};

function downloadImages(request){
	
	if(_.isArray(request)){
		_.forEach(request, function(values){
			_.forEach(values.image_keys, function(val){
				console.log("v");
				client.get(val).on('response', function(res){
					res.setEncoding('utf8');
			  		res.on('data', function(chunk){
			  			//console.log(chunk);
			  		});
				}).end();
			values.images.push(getS3Url(val));
			})
		})
		return request;
	}
	//else if it's a single json object
	_.forEach(request.image_keys, function(val){
		console.log("v");
			client.get(val).on('response', function(res){
				res.setEncoding('utf8');
		  		res.on('data', function(chunk){
		  			//console.log(chunk);
		  		});
			}).end();
			request.images.push(getS3Url(val));
		})

	return request;		
}

module.exports.searchNearestRecordByDate = function*(){
	
	let ctx = this;
	let patientId = MONGOOSE.Types.ObjectId(ctx.params.patient_id);
	let timeStamp = ctx.query.time_stamp;
	let current_difference = Number.MAX_SAFE_INTEGER;
	let nearest_record;
	let difference;

	let response = yield Record.find({"patient_id": patientId})
					.populate("food_history.food_id")
					.populate("current_prescription.pill_id")
					.populate("current_prescription.note", "note")
					.sort({"time_stamp": -1});

	if(_.isEmpty(response)){
		return yield ctx.respond(404, response, "No record for the given patient id exists");
	}
	else{
		_.forEach(response, function(val){
			difference = val.time_stamp - timeStamp;
			if(Math.abs(difference) < Math.abs(current_difference)){
				current_difference = difference;
				nearest_record = val;
			}
		});

		let newResponse = downloadImages(nearest_record);
		return yield ctx.respond(newResponse);
	}

}

module.exports.getAllRecords = function*(){

	let ctx = this;

	let patientId = MONGOOSE.Types.ObjectId(ctx.params.patient_id);

	let response = yield Record
					.find({"patient_id": patientId})
					.populate("food_history.food_id")
					.populate("current_prescription.pill_id")
					.populate("current_prescription.note", "note")
					.sort({"time_stamp": -1});

	if(!_.isEmpty(response)){
		//download images
		let newResponse = downloadImages(response);
		// _.forEach(newResponse, function(val){
		// 	console.log("a",_.omit(val, "__v"));
		// 	console.log("vv",val);
		// })
		let patientNotes = yield Note.find({"patient_id": patientId});
		let result = insertNotes(newResponse, patientNotes);
		return yield ctx.respond(result);
	}

	return yield ctx.respond(400, response, "Records not found");
	
	// let jsonInput = [];

	// //calculating the percentage of the meal plan followed. Future use.

	// _.forEach(response, function(val){
	// 	let num = 0;
	// 	let total = 0;
	// 	_.forEach(val.food_history, function(v){
	// 		total++;
	// 		if(v.eaten_today == true){
	// 			num++;
	// 		}
	// 	})
	// 	let jsonElement = {
	// 		date: "string",
	// 		perc: "string"				
	// 	}
	// 	jsonElement.date = val.date;
	// 	jsonElement.perc = Math.floor(num/total*100);
	// 	jsonInput.push(jsonElement);
	// })
};

module.exports.updateRecord = function*(){

	let ctx = this;
	let patientId = MONGOOSE.Types.ObjectId(ctx.params.patient_id);
	
	//check if the supplied id in the parameter is same as the one in the token
	if(patientId.toString() != ctx.state.user.toString()){

	}

	let timeStamp = ctx.params.time_stamp;
	let date = moment.unix(timeStamp).format('MM-DD-YYYY');

	let food = ctx.request.body.food;
	let foodId = [];

	_.forEach(food, function(val){
		foodId.push(val.food_id);
	})


	let output = yield Record
						.findOne({"patient_id": patientId, "date": date}, {image_keys: 0})
						.where("food_history.food_id")
						.in(foodId)
						.populate("food_history.food_id")
						.populate("current_prescription.note", "note")
						.populate("current_prescription.pill_id");


	if(_.isEmpty(output)){
		return yield ctx.respond(400, result, "Record not found. Check time stamp");
	}
						
	//flip eaten_today values
	_.forEach(output.food_history, function(value){
		if(_.includes(foodId, value.food_id._id.toString())){
			value.eaten_today = !value.eaten_today;
		}
	})

	let result = yield output.save();

	if(_.isEmpty(result))
		return yield ctx.respond(400, result, "Not found");
	else
		return yield ctx.respond(true, 200, result);

};

function addToS3(buffer, key){

	let req = client.put(key, {
		'Content-Length': Buffer.byteLength(buffer),
		'Content-Type': 'text/plain'
	});

	req.on('response', function(res){
		if(res.statusCode != 200){
			return ctx.respond(false, 400, "unable to save images at this point");
		}
	});
	req.end(buffer);

}

module.exports.addImage = function* (){


	let ctx = this;
	let patientId = MONGOOSE.Types.ObjectId(ctx.params.patient_id);
	let timeStamp = ctx.params.time_stamp;
	let date = moment.unix(timeStamp).format('MM-DD-YYYY');
	let image = ctx.request.body.image;
	let key = patientId+date;

	let record = yield Record.findOne({"patient_id": patientId, "date": date});
	
	if(_.isEmpty(record))
		return yield ctx.respond(404, record, "record does not exist");

	key = key+record.__v;
	record.image_keys.push(key);

	var imageBuffer = new Buffer(image, 'base64');

	addToS3(imageBuffer, key);

	//added functionality for thumbnails if needed in the future
	
	lwip.open(imageBuffer, 'jpg', function(err, image){

		image.resize(256, 256, function(err,img){
			img.toBuffer('jpg', { quality: 50 }, function(err, buffer){
				key = "thumb"+key;
				addToS3(buffer, key);
			})
		})
	})

	let result = yield record.save();

	if(_.isEmpty(result))
		return yield ctx.respond(400, result, "Could not add");
	else
		return yield ctx.respond(true, 200, result);
};

module.exports.deleteRecord = function*(){
	
	let ctx = this;
	let recordId = MONGOOSE.Types.ObjectId(ctx.params.ID);

	let result = yield Record.findByIdAndRemove(recordId);

	if(_.isEmpty(result))
		return yield ctx.respond(404, result, "Could not delete");
	else
		return yield ctx.respond(true, 200, result);

};




