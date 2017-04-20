'use strict'

let passport = require('koa-passport')
let LocalStrategy = require('passport-local').Strategy;
let User = require('../models/User');
let Token = require('../models/Token');
let _ = require('lodash');
let JWT = require('jsonwebtoken');
let key = "wow";
let moment = require('moment');
let MONGOOSE = require('mongoose');

module.exports = function*(next) {
	
	let ctx = this;


	try {
	
		let token = ctx.get('x-access-token') ? ctx.get('x-access-token') : (ctx.request.query['x-access-token'] ? ctx.request.query['x-access-token'] : false);
				
		if(token){
			let key = yield Token.findOne({"token": token});
			if(_.isEmpty(key)){
				return yield ctx.respond(false, 401, "Unauthorized");				
			}
			else{
				let decoded = yield attemptDecrypt(token, key.key);
				let userId = yield User.findOne({"_id": MONGOOSE.Types.ObjectId(decoded)}, {"token": 0});
				console.log(userId);
				if(_.isEmpty(userId)){
					return yield ctx.respond(false, 401, "Unauthorized");	
				}
				let accessVerified = null; //adjust value accordingly
				
				if(moment().isAfter(key.expires)){
					//token is expired
					return yield ctx.respond(false, 401, "token expired at "+key.expires);
				}
				
				if(userId.type_of_user.toString() === "patient"){
					//release all the paths for a patient
					if(ctx.fleek.routeConfig.details.tags.toString().includes("Patients"))
						accessVerified = 1;
					else
						accessVerified = null;
				}
				if(userId.type_of_user.toString() === "doctor"){
					//release all the paths for a doctor
					if(ctx.fleek.routeConfig.details.tags.toString().includes("Doctors"))
						accessVerified = 1;
					else
						accessVerified = null;
				}
				console.log(accessVerified); 
				if(accessVerified) {
					ctx.state.isAuthenticated = true;
					ctx.state.user =  decoded;
					console.log(ctx.state);
					yield next;
				} 
				else {
					yield ctx.respond(false, 401, "Unauthorized");
				} 	
			} 
		}
		else {
			yield ctx.respond(false, 412, 'An x-access-token is required to be passed in the HTTP Header');
		}
	}
	catch(err){
		console.log(err);
		 yield ctx.respond(false, 500, 'An internal server error has occured');
	}
}
let attemptDecrypt = (token, key) => {
  return new Promise ( ( resolve, reject) => {
    try {
      JWT.verify(token, key, (err, decoded) => {
        if (err) {
          return resolve (false);
        } else {
          return resolve (decoded);
        }
      });
    } catch (err) {
      return resolve (false);
    }
  });

};
 
