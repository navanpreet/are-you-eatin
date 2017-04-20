'use strict'

const CONFIG = require('../config/config');
let sg = require('sendgrid')(CONFIG.sendgrid.key);

let generateEmail = function (verification_token, email, option){	
	let host = CONFIG.host.address;
	let link = "http://"+host+"/"+option+"?id="+verification_token;
	//send email for verification

	var request = sg.emptyRequest({
		method: 'POST',
		path: '/v3/mail/send',
		body: {
			personalizations: [
				{
					to: [
						{
							email: email
						}
					],
					subject: 'Please '+option+''
				}
			],
			from: {
				email: 'verify@AreYouEatin.com'
			},
			content: [
				{
					type: 'text/html',
					value: "<html>Hello,<br> Please Click on the link to "+option+".<br><a href="+link+">Click here to verify</a><html>"
				}
			]
		}
	});
	
	return new Promise((resolve, reject) => {
		sg.API(request)
			.then(response => {
				console.log("res",response);
				return resolve(true);
		})
		.catch(error => {
			console.log("err",error);
			return resolve(false);
		});			
	})
	
};

module.exports.generateEmail = generateEmail;	

