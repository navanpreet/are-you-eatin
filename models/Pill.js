'use strict';

const MONGOOSE = require('mongoose');

let PillSchema = new MONGOOSE.Schema({ 
	name: { 
		type: String, 
		lowercase: true,
		unique: true
	}
});

let Pill = MONGOOSE.model('Pill', PillSchema);

module.exports = Pill;