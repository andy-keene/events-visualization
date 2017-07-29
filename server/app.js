'use strict';

//module import and init.
var express = require('express');
var parser = require('body-parser');
var sqlite3 = require('sqlite3').verbose();

//database init (create if it does not exist)
var db = new sqlite3.Database('events.db');
db.run("CREATE TABLE IF NOT EXISTS events (time TEXT, remote_ip TEXT, host_ip TEXT, remote_port TEXT, service TEXT, type TEXT, host_longitude INTEGER, host_latitude INTEGER, remote_longitude INTEGER, remote_latitude INTEGER, remote_country_name TEXT, remote_city TEXT, username TEXT, password TEXT, description TEXT)");


// server and middleware for both 
// url-encoded and json POST decoding
var server = express();

server.use(parser.urlencoded({'extended': false}));
server.use(parser.json());

//basic root
server.get('/', function(req, res) {

	res.status(200);
	res.set({
		'Content-type': 'text/plain'
	});

	res.send('welcome to the events server');
});

//POST events for storage
server.post('/event', function(req, res) {

	res.status(200);
	res.set({
		'Content-Type': 'text/plain'
	});

	db.serialize(function() {
		var stmt = db.prepare(`INSERT INTO events (time, remote_ip, host_ip, remote_port, 
						      service, type, host_longitude, host_latitude, remote_longitude, 
						      remote_latitude, remote_country_name, remote_city, username, password, 
						      description) 
						      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
		stmt.run(req.body.time, req.body.remote_ip, req.body.host_ip,
				 req.body.remote_port, req.body.service, req.body.type,
				 req.body.host_longitude, req.body.host_latitude, req.body.remote_longitude,
				 req.body.remote_latitude, req.body.remote_country_name, req.body.remote_city, 
				 req.body.username, req.body.password, req.body.description, req.body);
		stmt.finalize();
	}); //end insert


	console.log("Here is the body we recieved: ");
	console.log(req.body);

	//console.log(req.body.remote_ip);
	res.send('Thank you');

});


//app kick off!
server.listen(8080);
