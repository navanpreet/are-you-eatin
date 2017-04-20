'use strict'

let Token = require('../models/Token');
let User = require('../models/User');
let MONGOOSE = require('mongoose');
let _ = require('lodash');
let moment = require('moment');
let Reg = require('../models/Reg');

module.exports.signOut = function*(){

	let ctx = this;

	if(!ctx.state.user)
		return yield ctx.respond(500, {}, "An internal server error has occured");
	
	let userId = MONGOOSE.Types.ObjectId(ctx.state.user);

	

	if(!ctx.header['x-access-token'])
		return yield ctx.respond(401, "", "Token missing"); //should never reach this thanks to the middleware

	let result = yield Token.findOne({"token": receivedToken});

	if(_.isEmpty(result)){
		return yield ctx.respond(404, result, "token not found");
	}

	result.expires = moment();

	try{
		let regDocument = yield Reg.findOneAndRemove({"user_id": userId});
		yield result.save();
		return yield ctx.respond(true, 200, "token successfully killed");
	}catch(err){
		return yield ctx.respond(500, err, err);
	}
};
