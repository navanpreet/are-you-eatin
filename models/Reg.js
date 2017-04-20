'use strict';

const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

let RegSchema = new MONGOOSE.Schema({ 
	user_id: {
		type: Schema.Types.ObjectId
	},
	device_id: {
		type: String,
		unique: true
	},
	expires: {
		type: String
	},
	registration_id: {
		type: String
	}	
});

let Reg = MONGOOSE.model('Reg', RegSchema);

module.exports = Reg;