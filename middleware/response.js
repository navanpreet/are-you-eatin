'use strict'
let _ = require('lodash');

module.exports = (app) => {
	app.use( function * (next){
		let ctx = this;
		let respond = function * (success, code, body, err){
		if(_.size(arguments) === 1){	
			body = success;
			success = true;
			code = 200;	
		}

		if(_.isNumber(success)){
			if(success === 200 || success === 201){
				err = body || " ";
				body = code;
				success = true;
				code = success;
					
			}
			else{
				err = body || " ";
				body = code;
				code = success;
				success = false;
			}

		}

		if(!_.isArray(body)){
			body = [body];
		}
		//check if body is null
		if(body == null || body == undefined || body == false){
			console.log("inb");
			body = [];
		}

		// hide all the image keys in the response
		
		_.each(body, function(val){
			if(!(val.image_keys == null || val.image_keys == undefined || val.image_keys == false)){
				val.image_keys = [];
			}
			// _.each(val.current_prescription, function(v){
			// 	if(v.note == null){
			// 		v.note = {};
			// 	}
			// })
			// console.log(val);
		})

		var newResponse = {
			success: success,
			code: code,
			data: [{
				error_message: err || " ",
				result: body
			}]
		}
		try {
			ctx.response.status = code;
			ctx.response.body = newResponse;
			return true;

		} catch(error){
			
			newResponse.code = code;
			newResponse.success = false;
			newResponse.data.error_message = err;
			newResponse.data.result = body;

			return false;
		}
		};

		ctx.respond = respond;
		yield next;

	});
};