'use strict';

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

describe('create a record', function(){
	it('should create a new record in the db', function(done){

		let ID = "579b9839c0b86a273a4dabda";
		let time_stamp = "1470091445";
		request(url)
			.post('/record/patient/'+ID+'/time/'+time_stamp+'/new')
			.set('x-access-token', token)
			.end(function(err,res){
				if(err)
					throw err; 
				expect(res.body.data[0].result[0].patient_id).to.be.equal(ID);
				done();
			});
	});
});

describe('searches all record for a patient', function(){
	it('should return a list of all records given a patient id', function(done){

		let ID = "579b9839c0b86a273a4dabda";
		
		request(url)
			.post('/record/patient/'+ID+'/record/search/all')
			.set('x-access-token', token)
			.end(function(err,res){
				if(err)
					throw err; 
				expect(res.body.success).to.be.equal(true);
				done();
			});
	});
});

describe('searches all record for a patient', function(){
	it('should return a list of all records given a patient id', function(done){

		let ID = "579b9839c0b86a273a4dabda";
		
		request(url)
			.post('/record/patient/'+ID+'/record/search/all')
			.set('x-access-token', token)
			.end(function(err,res){
				if(err)
					throw err; 
				expect(res.body.success).to.be.equal(true);
				done();
			});
	});
});

describe('updates the eaten today of records', function(){
	it('should return a record with the updated boolean values for eaten_today given a patient id', function(done){

		let ID = "579b9839c0b86a273a4dabda";
		let time_stamp = "1470091445";
		let obj = {
			"food": [
	            {
	                "food_id":"57855334024f718b6378f3cb"       
	            }
       		]
		}
		
		request(url)
			.put('/patient/'+ID+'/time/'+time_stamp+'/record/update')
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