'use strict';

const MONGOOSE = require('mongoose');
const Schema = MONGOOSE.Schema;

let MatchSchema = new MONGOOSE.Schema({ 
	patient_id: { 
		type: Schema.Types.ObjectId
	},
	string_to_be_matched: {
		type: Number
	}
});

let Match = MONGOOSE.model('Match', MatchSchema);

module.exports = Match;
