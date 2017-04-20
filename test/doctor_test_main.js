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

describe('creating a doctor', function(){
	it('should create a doctor', function(done){
		
	var obj = {
	 name : "Dr. Dre",
	 email :"Dre@apple.com"
	}

	request(url)
		.post('/doctor/create')
		.set('x-access-token', 'eyJhbGciOiJIUzI1NiJ9.NTc5Yjk3NTNjMGI4NmEyNzNhNGRhYmQ4.1Vh3ooZGCCGR3amZDCKuA7DqUlUG3B0FfdXjWgy5N1M')
		.send(obj)
		.end(function(err,res){
			if(err)
				throw err; 
			console.log(res.body.data[0].result[0]);
			expect(res.body.data[0].result[0].name).to.be.equal(obj.name.toLowerCase());
			expect(res.body.data[0].result[0].email).to.be.equal(obj.email.toLowerCase());
			done();
		});
	});
});