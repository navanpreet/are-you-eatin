'use strict';

var chai = require('chai');
var assert = chai.assert;
var mongoose = require('mongoose');
var mockgoose = require('mockgoose');
var Food = require('../models/Food');
var request = require('supertest');
var should = require('should'); 
var expect = require('chai').expect;
var url = "localhost:3000/v1";

describe('searching for a pill', function(){
	it('should fetch a pill name', function(done){
		
	var name = "advil";

	request(url)
		.get('/pill/'+name)
		//.send(name)
		.end(function(err,res){
			if(err)
				throw err; 
			expect(res.body.data[0].result[0].name).to.be.equal(name);//.have.deep.equal({data: [{error_message: ' '}]});
			done();
		});
	});
});

describe('searching for all pills', function(){
	it('should fetch a list of all pills', function(done){

	request(url)
		.get('/pill/all')
		.end(function(err,res){
			if(err)
				throw err;
			//console.log(res.body.data[0].result[0]);
			expect(res.body.data[0].result).to.be.instanceof(Array);
			done();
		});
	});
});