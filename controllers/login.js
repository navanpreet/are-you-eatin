'use strict'

let Token = require('../models/Token');
let _ = require('lodash');
let passport = require('koa-passport');
let LocalStrategy = require('passport-local').Strategy;
let co = require('co');
let User = require('../models/User');
let generateToken = require('../helpers/generateToken').generateToken;
let moment = require('moment');
let crypto = require('crypto');
let bcrypt = require('co-bcrypt');
let Reg = require('../models/Reg');



passport.initialize();
passport.session();

passport.use(new LocalStrategy(function(username, password, done){
	co(function*(){

		let userExists = yield User.findOne({"username": username});
		if(_.isEmpty(userExists)){
			done(null, false);
		}
		else {
			if(yield bcrypt.compare(password, userExists.password)){
				done(null, true);
			}
			else
				done(null, false);
		}		
	})
}));


module.exports.login = function*() {

	let ctx = this;
	let body = ctx.request.body;
	let username = body.username;
	let password = body.password;
	
	let wrapper = {
		id: "string",
		token: "string"
	}

	yield passport.authenticate('local', function* (err,user,info){
		
		if(err){
			throw err;
		}
		if(user === false){
			return yield ctx.respond(401, user, "Incorrect username or password");
		}
		else {

			let user = yield User.findOne({"username": username});
			if(_.isEmpty(user)){
				return yield ctx.respond(404, user, "User not found");
			}
			let key = crypto.randomBytes(32).toString('hex');
			let generatedToken = generateToken(user, key);
			let token = new Token();
			token.token = generatedToken;
			token.key = key;
			token.expires = moment().add(30, 'days').format();

			if(body.device_id && body.registration_id){
				let checkIfRegExists = yield Reg.findOne({"user_id": user._id, "device_id": body.device_id});
				try{
					if(_.isEmpty(checkIfRegExists)){
						let reg = new Reg();
						reg.user_id = user._id;
						reg.device_id = body.device_id;	
						reg.registration_id = body.registration_id;	
						yield reg.save();
					}
					else{
						checkIfRegExists.registration_id = body.registration_id;
						yield checkIfRegExists.save();
					}
				}catch(err){
					return yield ctx.respond(500, err, err);
				}
			}
			let result = yield token.save();
			wrapper.id = user._id;
			wrapper.token = generatedToken;

			if(_.isEmpty(result))
				return yield ctx.respond(400, result, "Already exists");
			else
				return yield ctx.respond(true, 200, wrapper);

		}
	});
};

