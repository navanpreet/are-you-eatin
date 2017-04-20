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
mongoose.connect('mongodb://localhost:27017/foodtrack');
var url = "localhost:3000/v1";

describe('searching for a food', function(){
	it('should fetch a food name', function(done){
		
	var name = "chicken";

	request(url)
		.get('/food/'+name)
		.set('x-access-token', token)
		.end(function(err,res){
			if(err)
				throw err; 
			expect(res.body.data[0].result[0].name).to.be.equal(name);
			done();
		});
	});
});

describe('searching for all the foods', function(){
	it('should fetch a list of all foods', function(done){

	request(url)
		.get('/food/all')
		.end(function(err,res){
			if(err)
				throw err;
			//console.log(res.body.data[0].result[0]);
			expect(res.body.data[0].result).to.be.instanceof(Array);
			done();
		});
	});
});




