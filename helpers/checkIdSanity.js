'use strict'

let _ = require('lodash');
const MONGOOSE = require('mongoose');

let checkIdSanity = (payload) => {
		
	if(_.isEmpty(payload)){
		return false;
	}
	if(MONGOOSE.Types.ObjectId.isValid(payload)){
		return true;
	}
	return false;
};

module.exports = checkIdSanity;