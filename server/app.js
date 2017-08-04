'use strict';

//module import and init.
var express = require('express');
var parser = require('body-parser');
var sqlite3 = require('sqlite3').verbose();

//database init (create if it does not exist)
var db = new sqlite3.Database('events.db');
db.run("CREATE TABLE IF NOT EXISTS events (time TEXT, remote_ip TEXT, host_ip TEXT, remote_port TEXT, service TEXT, type TEXT, host_longitude INTEGER, host_latitude INTEGER, remote_longitude INTEGER, remote_latitude INTEGER, remote_country_name TEXT, remote_city TEXT, username TEXT, password TEXT, description TEXT)");



var server = express();

// server and middleware for both url-encoded and json POST decoding
// and serving static content
server.use(parser.urlencoded({'extended': false, 'limit': 1024}));
server.use(parser.json());
server.use('/', express.static(__dirname + '/static/'));

//basic root
server.get('/', function(req, res) {

	res.status(200);
	res.set({
		'Content-type': 'text/plain'
	});

	res.send('welcome to the events server');
});

//POST event for storage
//this could use some work on error checking
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

	res.send('ok');
});

//GET all events from storage
server.get('/events', function(req, res) {

	res.set({
		'Content-Type': 'application/json'
	});

	db.all('SELECT * FROM events', function(err, rows){
		if(err){
			res.status(500);
			res.send({
				"error": err,
				"events": []
			});
		} 
		else {
			res.status(200);
			res.send({
				"error": null,
				"events": rows
			});
		}
	});
});

//GET specific event details
server.get('/events/locations', function(req, res) {
	res.set({
		'Content-Type': 'application/json'
	});

	db.all("SELECT remote_longitude, remote_latitude, service, remote_city, count(case when type='connect' then 1 else null end) as connect_events, count(case when type='password' then 1 else null end) as password_events, count(case when type='reverse mapping' then 1 else null end) as reverse_mapping_events, count(*) as total_events FROM events GROUP BY remote_latitude, remote_longitude", function(err, rows){
		if(err){
			res.status(500);
			res.send({
				"error": err,
				"events": []
			});
		} 
		else {
			res.status(200);
			res.send({
				"error": null,
				"events": rows
			});
		}
	});
});

//app kick off!
server.listen(8080);
