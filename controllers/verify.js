'use strict'

let Verification_tokens = require('../models/Verification_tokens');
let User = require('../models/User');
let MONGOOSE = require('mongoose');
let randomString = Math.floor((Math.random() * 10000));
let _ = require('lodash');
let moment = require('moment');
let generateEmail = require('../helpers/generateEmail').generateEmail;
let generateVerificationToken = require('../helpers/generateVerificationToken');

module.exports.verifyEmail = function*(){

	//verify email

	let ctx =  this;
	let token = yield Verification_tokens.findOne({"verification_token": ctx.request.query.id});
	console.log("here")
	if(_.isEmpty(token)){
		return yield ctx.respond(404, token, "token not found");
	}

	if(moment().isAfter(token.expires)){
		return yield ctx.respond(401, token, "token expired at "+token.expires);
	}

	let user = yield User.findById(token.user_id, "username");

	if(_.isEmpty(user)){
		return yield ctx.respond(404, user, "user not found");
	}

	user.email_verified = true;

	try{
		yield user.save();
	}
	catch(err){
		return yield ctx.respond(500, err, err);
	}

	return yield ctx.respond(true, 200, user);

};

module.exports.newEmailVerificationToken = function*(){

	let ctx = this;

	let userId = MONGOOSE.Types.ObjectId(ctx.request.body.user_id);

	let searchUser = yield User.findById(user_id);

	if(!_.isEmpty(searchUser)){
		let verification_token = yield generateVerificationToken(ctx, searchUser._id);

		let emailResponse = yield generateEmail(verification_token, searchUser.email, "verify");
	
		if(emailResponse == true)
			return yield ctx.respond(true, 200, emailResponse);
		else
			return yield ctx.respond(emailResponse, emailResponse, "Could not send email");
	}
	else{
		return yield ctx.respond(404, searchUser, "User not found");
	}
};