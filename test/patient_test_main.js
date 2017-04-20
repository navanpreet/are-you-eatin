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

/*describe('creating a patient', function(){
	it('should create a patient', function(done){
		
	var obj = {
	 
	 name : "Patient zero",
	 email :"patien1t@zero.com",
	 doctor_id: "123456789012",

	}

	request(url)
		.post('/patient/create')
		.send(obj)
		.end(function(err,res){
			if(err)
				throw err; 
			console.log(res.body);
			expect(res.body.data[0].result[0].name).to.be.equal(obj.name.toLowerCase());
			expect(res.body.data[0].result[0].email).to.be.equal(obj.email.toLowerCase());
			done();
		});
	});
});
*/
// describe('retrieving a patient', function(){
// 	it('should get information for a patient', function(done){
		
// 	var obj = {	 
// 	 name : "patient zero",
// 	 email :"Patient@zero.com"
// 	}
// 	request(url)
// 		.get('/patient/'+obj.name+'/retrieve')
// 		.set('x-access-token', 'eyJhbGciOiJIUzI1NiJ9.NTc5Yjk3NTNjMGI4NmEyNzNhNGRhYmQ4.1Vh3ooZGCCGR3amZDCKuA7DqUlUG3B0FfdXjWgy5N1M')
// 		.end(function(err,res){
// 			if(err)
// 				throw err; 
// 			console.log(res.body);
// 			expect(res.body.data[0].result[0].name).to.be.equal(obj.name.toLowerCase());
// 			done();
// 		});
// 	});
// });

describe('get all patients for  a doctor', function(){
	it('should get information for a patient who goes to a doctor', function(done){
		
	var obj = {
	 
	 doctor_id: "5787f7dd2c4fa4fa7a4deb41"
	
	}
	request(url)
		.get('/doctor/'+obj.doctor_id+'/patients')
		.set('x-access-token', token)
		.end(function(err,res){
			if(err)
				throw err;
			expect(res.body.data[0].result[0].doctor_id).to.be.equal(obj.doctor_id);
			done();
		});
	});
});