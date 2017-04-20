'use strict';

const MONGOOSE = require('mongoose');

let FoodSchema = new MONGOOSE.Schema({ 
	name: { 
		type: String, 
		lowercase: true,
		unique: true
	} 
});

let Food = MONGOOSE.model('Food', FoodSchema);

module.exports = Food;

