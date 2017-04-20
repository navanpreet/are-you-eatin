'use strict';

const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

let RecordSchema = new MONGOOSE.Schema({ 
	patient_id: { 
		type: Schema.Types.ObjectId, 
		lowercase: true 
	},
	diet_id: { 
		type: Schema.Types.ObjectId 
	},
	time_stamp: { 
		type: String 
	},
	date: {
		type: String
	},
	images: [{
		type: String
	}],
	image_keys: {
		type: [{
			type: String
		}]
	},
	food_history: [{ 
		food_id: { type: Schema.Types.ObjectId , 
			ref: 'Food'
		}, 
		eaten_today: Boolean 
	}],
	prescription_id : {
		type: Schema.Types.ObjectId 
	},
	current_prescription: [{
		pill_id: {
			type: Schema.Types.ObjectId,
			ref: 'Pill'
		},
		note: {
			type: Schema.Types.ObjectId,
			ref: 'Note'
		}
	}]	

});

let Record = MONGOOSE.model('Record', RecordSchema);

module.exports = Record;
