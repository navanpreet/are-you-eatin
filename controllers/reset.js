'use strict'
let User = require('../models/User');
let Verification_tokens = require('../models/Verification_tokens');
let _ = require('lodash');
let generateVerificationToken = require('../helpers/generateVerificationToken');
let generateEmail = require('../helpers/generateEmail').generateEmail;
let moment = require('moment');
let bcrypt = require('co-bcrypt');
const MONGOOSE = require('mongoose');

module.exports.forgot = function*(){

	//for forgot password

	let ctx = this;
	let email = ctx.request.body.email;

	let checkIfEmailExists = yield User.findOne({"email": email});
	
	if(_.isEmpty(checkIfEmailExists)){
		return yield ctx.respond(404, checkIfEmailExists, "E-Mail not found in records");
	}
	else{
		let verification_token = yield generateVerificationToken(ctx, checkIfEmailExists._id, 4);
		let emailResponse = yield generateEmail(verification_token, email, "reset");
		
		if(emailResponse == true)
			return yield ctx.respond(true, 200, "Email successfully sent");
		else
			return yield ctx.respond(500, null, "Could not send email");
	}
}

module.exports.reset = function*(){

	//for resetting password
	let ctx = this;
	console.log(ctx.request.query);
	let token = yield Verification_tokens.findOne({"verification_token": ctx.request.query.id});
	
	if(_.isEmpty(token)){
		return yield ctx.respond(404, token, "token not found")
	}
	if(moment().isAfter(token.expires)){
		return yield ctx.respond(401, token, "token expired at "+token.expires);
	}
	
	let user = yield User.findById(token.user_id);
	if(_.isEmpty(user)){
		return yield ctx.respond(404, user, "User not found");
	}

	let response = {
		"user_id": token.user_id,
		"message": "Reset token successfully verified. Proceed with resetting password."
	}
	return yield ctx.respond(true, 200, response);
};



module.exports.setNewPassword = function*(){

	let ctx = this;
	let newPass = ctx.request.body.password;
	let userId = MONGOOSE.Types.ObjectId(ctx.request.body.user_id);

	let user = yield User.findById(userId);

	if(_.isEmpty(user)){
		return yield ctx.respond(404, user, "User not found");
	}

	let salt = yield bcrypt.genSalt(10); 
	let hash = yield bcrypt.hash(newPass, salt);
	user.password = hash;
	let response = {
		"user_id": userId,
		"message": "password successfully reset"
	}

	try{
		let result = yield user.save();
	}catch(err){
		return yield ctx.respond(500, err, "Could not save");
	}

	return yield ctx.respond(response);

};

module.exports.changePassword = function*(){

	let ctx = this;
	let oldPass = ctx.request.body.old_password;
	let userId = ctx.params.user_id;
	if(ctx.state.user!=userId){
		return yield ctx.respond(401, {userId}, "User not authorized");
	}
	let userDocument = yield User.findById(userId);
	
	if(_.isEmpty(userDocument)){
		return yield ctx.respond(404, {userDocument}, "User not found");
	}

	let response = {
		"message": "Password verified. Proceed with resetting password."
	}
	let incorrectResponse = {
		"message": "Password doesn't match."
	}
	if(yield bcrypt.compare(oldPass, userDocument.password))
		return yield ctx.respond(response);
	else
		return yield ctx.respond(401, incorrectResponse, "Password doesn't match.");		
}