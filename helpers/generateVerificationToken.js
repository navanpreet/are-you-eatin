'use strict'
let Verification_tokens = require("../models/Verification_tokens");
let co = require('co');
let crypto = require('crypto');
let moment = require('moment');
let MONGOOSE = require('mongoose');

let generate = function*(ctx, userId, size){
	console.log("uid", userId);
	let verification_token = crypto.randomBytes(size).toString('hex');	
	let verification = new Verification_tokens();
	verification.user_id = userId;
	verification.verification_token = verification_token;
	verification.expires = moment().add(1, 'h');
	
	try{
		yield verification.save();
	}catch(err){
		return yield ctx.respond(500, err, err);
	}
	return verification_token;
};

module.exports = generate;