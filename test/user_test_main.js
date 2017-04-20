'use strict';

var chai = require('chai');
var assert = chai.assert;
var mongoose = require('mongoose');
var mockgoose = require('mockgoose');
var Food = require('../models/Food');
var request = require('supertest');
var should = require('should'); 
var expect = require('chai').expect;
//mongoose.connect('mongodb://localhost:27017/foodtrack');
var url = "localhost:3000/v1";

var token = "";

describe('creating a user', function(){
	it('should create a user', function(done){
		
	var obj = {
	  username: "johnnyDoe",
	  first_name: "Johnny",
	  last_name: "Doe",
	  password: "JohnDoeIsMyName",
	  email: "JohnnyDoe@JohnDoe.com",
	  typeOfUser: "Doctor",
	  date_of_birth: "07/09/1993",
	  device_id: "123",
	  registration_id: "456"
	}

	request(url)
		.post('/signup')
		.send(obj)
		.end(function(err,res){
			if(err)
				throw err;
			expect(res.body.data[0].result[0].token).to.not.be.empty;
			token = res.body.data[0].result[0].token;
			done();
		});
	});
});

exports.token = token;