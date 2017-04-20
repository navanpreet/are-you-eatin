'use strict'

var chai = require('chai');
var assert = chai.assert;
var mongoose = require('mongoose');
var mockgoose = require('mockgoose');
var Food = require('../models/Food');
var request = require('supertest');
var should = require('should'); 
var expect = require('chai').expect;
var url = "localhost:3000/v1";

describe('login test', function(){
	it('should successfully login', function(done){
		
	var obj = { 
		username: "123",
	    password: "123"
	}

	request(url)
		.post('/login')
		.end(function(err,res){
			if(err)
				throw err; 
			expect(res.body.success).to.be.equal(true);
			done();
		});
	});
});