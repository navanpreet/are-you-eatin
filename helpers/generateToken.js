'use strict'

let JWT = require('jsonwebtoken');
let Token = require('../models/Token');
let _ = require('lodash');

let generateToken = (payload, key) => {
	if(!_.isString(payload)){
		let userId = payload._id.toString();
		let token = JWT.sign(userId, key);
		return token;
	}
};

module.exports.generateToken = generateToken;
	