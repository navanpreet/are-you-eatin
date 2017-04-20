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

describe('create a message', function(){
	it('should insert a new message in the db', function(done){
		
	let obj = {
		message: "hello again",
		time_stamp: "1470083004",
		user_id:"579b9753c0b86a273a4dabd8",
		receiver_id: "579b9839c0b86a273a4dabda",
		device_id: "123",
		registration_id: "456"
	};

	request(url)
		.post('/messages/new')
		.set('x-access-token', token)
		.send(obj)
		.end(function(err,res){
			if(err)
				throw err; 
			expect(res.body.data[0].result[0].message).to.be.equal(obj.message);
			done();
		});
	});
});

describe('searching for all the messages of a user', function(){
	it('should fetch a list of all messages', function(done){

	let ID = "579b9753c0b86a273a4dabd8";	

	request(url)
		.get('/messages/user/'+ID+'/retrieve/all')
		.set('x-access-token', token)
		.end(function(err,res){
			if(err)
				throw err;
			expect(res.body.data[0].result).to.be.instanceof(Array);
			done();
		});
	});
});

describe('searching for all the messages of a user and a receiver', function(){
	it('should fetch a list of all messages', function(done){

	let userID = "579b9753c0b86a273a4dabd8";
	let receiverID = "579b9839c0b86a273a4dabda";	

	request(url)
		.get('/messages/user/'+userID+'/receiver/'+receiverID+'/retrieve')
		.set('x-access-token', token)
		.end(function(err,res){
			if(err)
				throw err;
			expect(res.body.data[0].result).to.be.instanceof(Array);
			done();
		});
	});
});

describe('searching for all the messages of a user and a date', function(){
	it('should fetch a list of all messages for a given date', function(done){

	let userID = "579b9753c0b86a273a4dabd8";
	let date = "08-01-2016";	

	request(url)
		.get('/messages/user/'+userID+'/date/'+date+'/retrieve')
		.set('x-access-token', token)
		.end(function(err,res){
			if(err)
				throw err;
			expect(res.body.data[0].result).to.be.instanceof(Array);
			done();
		});
	});
});

describe('Delete message', function(){
	it('deletes a message for a given ID', function(done){

	let ID = "579fb4c53c60396ebf19a0f9";
	
	request(url)
		.delete('/messages/'+ID+'/delete')
		.set('x-access-token', token)
		.end(function(err,res){
			if(err)
				throw err;
			expect(res.body.success).to.be.equal(true);
			done();
		});
	});
});

describe('Update message', function(){
	it('updates a message for a given ID', function(done){

	let ID = "579fb4c53c60396ebf19a0f9";
	let obj = {
		message: "updated message",
	}
	
	request(url)
		.put('/messages/'+ID+'/update')
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


