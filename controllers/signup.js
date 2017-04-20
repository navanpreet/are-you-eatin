'use strict'

let User = require('../models/User');
let Doctor = require('../models/Doctor');
let Patient = require('../models/Patient');
let Diet = require("../models/Diet");
let Prescription = require("../models/Prescription");
let MONGOOSE = require('mongoose');
let _ = require('lodash');
let JWT = require('jsonwebtoken');
let Token = require('../models/Token');
let moment = require('moment');
let Reg = require('../models/Reg');
let crypto = require('crypto');
let generateToken = require('../helpers/generateToken').generateToken;
let generateEmail = require('../helpers/generateEmail').generateEmail;
let generateVerificationToken = require('../helpers/generateVerificationToken');
let createPatient = require('../controllers/patient').createPatient;
let createDoctor = require('../controllers/doctor').createDoctor;
let bcrypt = require('co-bcrypt');

const CONFIG = 	require('../config/config');


module.exports.signUp = function*(){
		
	let ctx = this;
	let body = ctx.request.body;
	console.log("1`", MONGOOSE.Types.ObjectId(undefined));
	
	let wrapper = {
		id: "string",
		token: "string"
	}

	let salt = yield bcrypt.genSalt(CONFIG.salt.rounds); 
	let hash = yield bcrypt.hash(body.password, salt);
	body.password = hash;
	
	let user = new User(body);
	let result;

	try{
		result = yield user.save();
	}
	catch(err){
		if(_.includes(err.message, "email")){
			return yield ctx.respond(409, err.message, "Email already exists");
		}
		else if(_.includes(err.message, "username")){
			return yield ctx.respond(409, err.message, "Username already exists");	
		}
	}
	if(result.type_of_user === "doctor"){
		ctx.state = user._id;
		var resp = yield createDoctor(ctx);
	}
	else if(result.type_of_user === "patient"){
		ctx.state = user._id;
		var resp = yield createPatient(ctx);
	}

	if(resp == 500){
		return yield ctx.respond(500, "{}", "could not create the user");
	}

	let key = crypto.randomBytes(32).toString('hex');
	let generatedToken = generateToken(result, key);
	let token = new Token();

	token.token = generatedToken;
	token.key = key;
	token.expires = moment().add(30, 'days').format();

	if(body.device_id && body.registration_id){
		let reg = new Reg();
		reg.user_id = ctx.state;
		reg.device_id = body.device_id;	
		reg.registration_id = body.registration_id;
		try{
			yield reg.save();	
		}catch(err){
			return yield ctx.respond(500, err, err);
		}
	}
	try{
		yield token.save();	
	}catch(err){
		return yield ctx.respond(500, err, err);
	}	
	
	wrapper.id = ctx.state;
	wrapper.token = generatedToken;
	let verification_token = yield generateVerificationToken(ctx, result._id, CONFIG.token.size);
	
	// new stuff
	// let host = "45.55.113.12";
	// let link = "http://"+host+"/v1/verify?id="+verification_token;
	// let isConnected = yield $c.ajax({url:host, method:'POST',alwaysResolve:true, data:{}});
	// console.log(isConnected,isConnected.constructor);
	let emailResponse = false;
	// if (isConnected.constructor != Error) {
		emailResponse = yield generateEmail(verification_token, result.email, "verify");
	// }
	// end new stuff

	console.log("email Response", emailResponse);

	if(emailResponse == true)
		return yield ctx.respond(true, 200, wrapper);
	else
		return yield ctx.respond(emailResponse, result, "Could not send email");
	
};





