'use strict'

let Message = require("../models/Message");
let MONGOOSE = require("mongoose");
let _ = require("lodash");
let moment = require("moment");
let Reg = require("../models/Reg");
let User = require("../models/User");
let request = require('koa-request');
const CONFIG = require('../config/config');
let genit = require('genit');


module.exports.newMessage = function*(){
	console.log("here");
	let ctx = this; 
	let body = ctx.request.body;
	let message = new Message();
	message.sender_id = body.user_id;
	message.message = body.message;
	message.time_stamp = body.time_stamp;
	message.receiver_id = body.receiver_id;
	message.date = moment.unix(body.time_stamp).format('MM-DD-YYYY');
	message.read = false;



	if(body.device_id && body.registration_id){
		
		//message from patient to doctor

		//update patient registration ids
		let checkRegId = yield Reg.findOne({"user_id": MONGOOSE.Types.ObjectId(body.user_id), "device_id": body.device_id});
		if(_.isEmpty(checkRegId)){
			try{
				let reg = new Reg();
				reg.user_id = MONGOOSE.Types.ObjectId(body.user_id);
				reg.device_id = body.device_id;
				reg.registration_id = body.registration_id;
				yield reg.save();
			}catch(err){
				return yield ctx.respond(500, err, err);
			}
		}	
		if(checkRegId.registration_id != body.registration_id){
			checkRegId.registration_id = body.registration_id;
		}
		try{
			yield checkRegId.save();
			yield message.save();
		}catch(err){
			return yield ctx.respond(500, err, err);
		}	
		let success = {status: "Successfully saved"};
		return yield ctx.respond(true, 200, success);

	}
	else{
		//message from doctor to patient
		let searchInReg = yield Reg.find({"user_id": MONGOOSE.Types.ObjectId(body.receiver_id)});
		
		if(_.isEmpty(searchInReg)){
			return yield ctx.respond(404, searchInReg, "Receiver id not found")
		}
		try{
			yield message.save();
		}catch(err){
			return yield ctx.respond(500, err, err);
		}
		let userDocument = yield User.findById(MONGOOSE.Types.ObjectId(body.user_id));
		let name = userDocument.first_name +" "+userDocument.last_name;
		let outputArray = [];
		yield genit.each(searchInReg, function*(val){
			let response = yield request({
				url: 'https://fcm.googleapis.com/fcm/send',
				method: 'POST',
				headers: {	
					'Authorization': CONFIG.firebase.key
				},
				json: {
					to: val.registration_id,
					data: {
						Sender: name,
						message: body.message
					}
				}
			})
			outputArray.push(response.body.success);
		})

		if(_.includes(outputArray, 0)){
			return yield ctx.respond(true, 202, "Could not send message to all devices");
		}
		return yield ctx.respond(true, 200, "Successfully sent messages to all devices");
	}
};	



module.exports.getAllMessagesForAUser = function*(){
	
	let ctx = this;
	let time_stamp = parseInt(ctx.params.time_stamp);
	let userId = MONGOOSE.Types.ObjectId(ctx.params.user_id);

	let result1 = yield Message.find({"sender_id": userId})
										.populate("sender_id", "first_name last_name")
										.populate("receiver_id", "first_name last_name")
										.sort({"time_stamp": -1});
	let result2 = yield Message.find({"receiver_id": userId})
										.populate("receiver_id", "first_name last_name")
										.populate("sender_id", "first_name last_name")
										.sort({"time_stamp": -1});

	
	let result = result1.concat(result2);

	result.sort(sortByProperty('time_stamp'));
	
	return yield ctx.respond(true, 200, result);
};


module.exports.getAllMessagesForAUserAndAReceiver = function*(){
	
	let ctx = this;
	let userId = MONGOOSE.Types.ObjectId(ctx.params.user_id);
	let receiverId = MONGOOSE.Types.ObjectId(ctx.params.receiver_id);

	let result = yield Message.find({"sender_id": userId, "receiver_id": receiverId})
								.populate("sender_id", "first_name last_name")
								.populate("receiver_id", "first_name last_name")
								.sort({"time_stamp": -1});

	return yield ctx.respond(true, 200, result);
};

let sortByProperty = function (property) {
    return function (x, y) {
        return ((x[property] === y[property]) ? 0 : ((x[property] > y[property]) ? 1 : -1));
    };
};

module.exports.getAllMessagesForAUserAfterADate = function*(){

	let ctx = this;
	let time_stamp = parseInt(ctx.params.time_stamp);
	let userId = MONGOOSE.Types.ObjectId(ctx.params.user_id);

	let result1 = yield Message.find({"sender_id": userId, "time_stamp": { $gt: time_stamp }})
										.populate("sender_id", "first_name last_name")
										.populate("receiver_id", "first_name last_name")
										.sort({"time_stamp": -1});
	let result2 = yield Message.find({"receiver_id": userId, "time_stamp": { $gt: time_stamp }})
										.populate("receiver_id", "first_name last_name")
										.populate("receiver_id", "first_name last_name")
										.sort({"time_stamp": -1});

	
	let result = result1.concat(result2);

	result.sort(sortByProperty('time_stamp'));

	
	return yield ctx.respond(true, 200, result);

};

module.exports.getAllMessagesForAUserAReceiverAfterADate = function*(){

	let ctx = this;
	let time_stamp = parseInt(ctx.params.time_stamp);
	let userId = MONGOOSE.Types.ObjectId(ctx.params.user_id);
	let receiverId = MONGOOSE.Types.ObjectId(ctx.params.receiver_id);

	let result1 = yield Message.find({"sender_id": userId, "receiver_id": receiverId, "time_stamp": { $gt: time_stamp }})
										.populate("sender_id", "first_name last_name")
										.populate("receiver_id", "first_name last_name")
										.sort({"time_stamp": -1});
	let result2 = yield Message.find({"receiver_id": userId, "sender_id": receiverId, "time_stamp": { $gt: time_stamp }})
										.populate("receiver_id", "first_name last_name")
										.populate("sender_id", "first_name last_name")
										.sort({"time_stamp": -1});

	
	let result = result1.concat(result2);

	result.sort(sortByProperty('time_stamp'));

	
	return yield ctx.respond(true, 200, result);

};

module.exports.updateRead = function*(){

	let ctx = this;
	let messageId = MONGOOSE.Types.ObjectId(ctx.params.message_id);

	let result = yield Message.findOneAndUpdate({"_id": messageId}, {"read": true});

	if(_.isEmpty(result))
		return yield ctx.respond(404, result, "Message not found");
	else
		return yield ctx.respond(true, 200, result);
	
};

module.exports.updateMessage = function*(){

	let ctx = this;
	let messageId = MONGOOSE.Types.ObjectId(ctx.params.message_id);
	let newMessage = ctx.request.body.message;

	let result = yield Message.findOneAndUpdate({"_id": messageId}, {"message": newMessage});

	if(_.isEmpty(result)){
		return yield ctx.respond(404, result, "Message not found");
	}
	else{
		result.message = newMessage;
		return yield ctx.respond(true, 200, result);
	}
};

module.exports.deleteMessage = function*(){

	let ctx = this;
	let messageId = MONGOOSE.Types.ObjectId(ctx.params.message_id);

	let data = yield Message.findOne({"_id": messageId});

	if(_.isEmpty(data)){
		return yield ctx.respond(404, data, "Message not found");
	}
	else{
		let result = yield data.remove();
		if(_.isEmpty(result))
			return yield ctx.respond(400, result, "Unable to delete");
		else
			return yield ctx.respond(true, 200, result);
	}
};


