'use strict'

var chai = require('chai');
var assert = chai.assert;
var mongoose = require('mongoose');
var mockgoose = require('mockgoose');
var Food = require('../models/Food');
var request = require('supertest');
var should = require('should'); 
var expect = require('chai').expect;
var token = require('./user_test_main').token;
var url = "localhost:3000/v1";

describe('diet test', function(){
	it('should add food to a diet ', function(done){

	var patientId = "579b9839c0b86a273a4dabda";	
		
	var obj = {
	 
	 time_stamp: "1468805782",
	 food: [
	 	{
	 		name: "kettle chips"
	 	},
	 	{
	 		name: "sea salt"
	 	}
	 ]

	}

	request(url)
		.post('/patient/579b9839c0b86a273a4dabda/diet/add')
		.set('x-access-token', token)
		.send(obj)
		.end(function(err,res){
			if(err)
				throw err; 
			console.log("response:", res.body.data[0].result);
			expect(res.body.success).to.be.equal(true);
			done();
		});
	});
});

describe('diet test', function(){
	it('should remove food to a diet ', function(done){

	var patientId = "579b9839c0b86a273a4dabda";	
		
	var obj = {
	 
	 time_stamp: "1468805782",
	 food: [
	 	{
	 		name: "kettle chips"
	 	}
	 ]

	}

	request(url)
		.post('/patient/579b9839c0b86a273a4dabda/diet/remove')
		.set('x-access-token', token)
		.send(obj)
		.end(function(err,res){
			if(err)
				throw err; 
			expect(res.body.success).to.be.equal(true);
			done();
		});
	});
});
