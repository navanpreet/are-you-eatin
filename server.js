'use strict'

var d = new Date();
console.log(d.toTimeString());

let koa = require('koa');
let koaCors = require('koa-cors');
let fleekRouter = require('fleek-router');
let bodyParser = require('koa-bodyparser');
let logger = require('koa-logger');
let mongoose = require('mongoose');
let CONFIG = require('./config/config.json');
let parser = require('fleek-parser');
let _ = require('lodash');
let swaggerDoc = parser.parse(process.cwd()+"/config/api.json");
var d = new Date();
console.log(d.toTimeString());
let app = module.exports = koa();
let passport = require('koa-passport');
let route = require('koa-route'); 
require('craydent/noConflict'); 

// app.use(function*(next){
// 	try{
// 		yield next;
// 	}catch(err){
// 		this.body = {success: "false", code: 500, data: [{error_message: "An Internal Server error has occured", result:[]}]};
// 	}
// });

let mongodb = CONFIG.resources.mongodb;
// override config if environmental variable exists
if (process.env.hasOwnProperty("MONGO_SERVER")) {
  mongodb = process.env.MONGO_SERVER;
}

mongoose.connect(mongodb);
mongoose.connection.on('error', (err) => {
  console.error(err.stack || err);
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running on '+ mongodb);
  process.exit(1);
});

app.use(logger());
app.use(bodyParser({jsonLimit:"50mb"}));
app.use(koaCors());

let paths = require("./config/api.json");
paths.paths = {};
// console.log(paths);
let re = /:\w+/g
_.each(swaggerDoc.paths, function(val, key){
	let path = key.replace(re, substitute);
	paths.paths[path] = val;
})
//console.log(paths);
function substitute(match){
	let res = match.slice(1, match.length);
	return '{'+res+'}';
}

require('./middleware/response')(app);

var d = new Date();
console.log(d.toTimeString());
fleekRouter(app, {
	controllers : './controllers',
	swagger : swaggerDoc, //pass the swaggerDoc here
    documentation : {
        // prevent the breaking of path params
        swagger : paths
    },
    validate: {catch: function*(err){this.body = err}},
    authenticate: require('./middleware/authenticate'),
})
var d = new Date();
console.log(d.toTimeString());
console.log("now listening");
app.listen(CONFIG.internal.port);
