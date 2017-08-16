'use strict';

//package imports
var parser = require('body-parser');
var sqlite3 = require('sqlite3').verbose();
var moment = require('moment');
var mustache = require('mustache');
var fs = require('fs');
//... and inits
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);


//database init (create if it does not exist)
var db = new sqlite3.Database('events.db');
db.run(`CREATE TABLE IF NOT EXISTS events (
        time TEXT, remote_ip TEXT, host_ip TEXT,
        remote_port TEXT, service TEXT, type TEXT,
        host_longitude INTEGER, host_latitude INTEGER,
        remote_longitude INTEGER, remote_latitude INTEGER,
        remote_country_name TEXT, remote_city TEXT,
        username TEXT, password TEXT, description TEXT)`);



// app and middleware for both url-encoded and json POST decoding
// and serving static content
app.use(parser.urlencoded({'extended': false, 'limit': 1024}));
app.use(parser.json());
app.use('/', express.static(__dirname + '/static/'));


// socket stuff
io.on('connection', function(clientSocket){
    console.log('connection');
    //do nothing
});


//basic root
app.get('/', function(req, res) {
    io.emit('event', {'hey' : 'there'})
    res.status(200);
    res.set({
        'Content-type': 'text/plain'
    });

    res.send('welcome to the events app');
});

//POST event for storage
//this could use some work on error checking
app.post('/event', function(req, res) {

    res.status(200);
    res.set({
        'Content-Type': 'text/plain'
    });

    db.serialize(function() {
        var stmt = db.prepare(`INSERT INTO events (
                               time, remote_ip, host_ip, remote_port,
                               service, type, host_longitude, host_latitude,
                               remote_longitude,remote_latitude, remote_country_name,
                               remote_city, username, password, description)
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        stmt.run(req.body.time, req.body.remote_ip, req.body.host_ip,
                 req.body.remote_port, req.body.service, req.body.type,
                 req.body.host_longitude, req.body.host_latitude, req.body.remote_longitude,
                 req.body.remote_latitude, req.body.remote_country_name, req.body.remote_city, 
                 req.body.username, req.body.password, req.body.description);
        stmt.finalize();

        db.all(`SELECT 
                host_longitude, host_latitude, remote_longitude, remote_latitude,
                GROUP_CONCAT(DISTINCT service) as services, remote_city, count(*) as total_events 
                FROM events
                WHERE remote_latitude=? AND remote_longitude=? 
                GROUP BY remote_latitude, remote_longitude`,
                req.body.remote_latitude, req.body.remote_longitude, function(err, rows){
            
            if(!err && rows.length === 1){
                rows[0].service = req.body.service;
                io.emit('event', rows[0]);
            }
        });
    }); //end insert / emission
    res.send('ok');
});

//POST event for storage
app.get('/event', function(req, res) {

    if(!req.query.longitude || !req.query.latitude){
        res.status(400);
        res.set({
            'Content-Type': 'text/plain'
        });
        res.send('bad query!');
    }
    else {
        db.serialize(function() {
            var stmt = db.prepare(`SELECT * from events WHERE remote_longitude=? AND remote_latitude=?`);
            stmt.all(req.query.longitude, req.query.latitude, function(err, rows){
                if(err){
                    res.status(500);
                    res.set({
                        'Content-Type': 'application/text'
                    });
                    res.send('something went wrong');
                }
                else {
                    res.status(200);
                    res.set({
                        'Content-Type': 'text/html'
                    });
                    fs.readFile('./static/eventTable.html', function(err, data) {

                        res.write(mustache.render(data.toString(), {
                            events: rows,
                            functionTime: function(){
                                return function(time, render){
                                    return moment.unix(render(time)).format('HH:mm:ss');
                                }
                            },
                            functionDate: function(){
                                return function(time, render){
                                    return moment.unix(render(time)).format('YYYY-MM-DD');
                                }
                            },
                            functionLocation: function(){
                                return function(eventLocation, render){
                                    let location = render(eventLocation);
                                    let city = location.split(',')[0];
                                    let country = location.split(',')[1];

                                    if(!city && !country){
                                        return 'Unknown Location';
                                    }
                                    else if(!city){
                                        return 'Unknown City, ' + country;
                                    }
                                    else if(!country){
                                        return city + ', Unknown Country';
                                    }
                                    else {
                                        return city + ', ' + country;
                                    }
                                }
                            }
                        }));
                        res.end();
                    });
                }
            });
            stmt.finalize();
        }); //end serialization
    }
});

//returns all events from storage as json list in a file download
//chunks writes one at time to avoid memory overload
//note: this shuold just return the database, or a filter of todays events (maybe remove?)
app.get('/events', function(req, res) {

    res.status(200);
    res.set({
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename=events.json'
    });
    res.write('{"events":[');
    var firstWrite = true;
    db.each(`SELECT * FROM events`, function(err, row){
        //row callback - chunk each successful retrival 
        if(!err){
            res.write((firstWrite ? "" : ",") + JSON.stringify(row));
            firstWrite = false;
        } 
    }, function(err, numRows){
        //completion callback - if numRows == 0, the events array will be empty
        //end of transmission
        res.write(']}');
        res.end();
    });
});

//returns list of events which occured during the last three days
app.get('/recentEvents', function(req, res) {

    res.status(200);
    res.set({
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename=events.json'
    });

    var yesterday = moment().utc().add(-3, 'days').valueOf() / 1000;
    var stmt = db.prepare(`SELECT * FROM events WHERE time > ?`);
    stmt.all(yesterday, (err, rows)=>{
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

//GET event details grouped by location
app.get('/events/locationData', function(req, res) {

    res.set({
        'Content-Type': 'application/json'
    });
    db.all(`SELECT 
            host_longitude, host_latitude, remote_longitude, remote_latitude, 
            service, GROUP_CONCAT(DISTINCT service) as services, remote_city, count(*) as total_events
            FROM events
            GROUP BY remote_latitude, remote_longitude`, function(err, rows){
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

//GET event count by the hour
//this is pretty inefficient...
app.get('/events/timeLineData', function(req, res) {
    
    res.set({
        'Content-Type': 'application/json'
    });

    //defines the grouing (i.e. by hour, minute, etc)
    var timeFormat = 'YYYY-MM-DD HH:00:00';

    db.all(`SELECT time, service FROM events
            ORDER BY time`, (err, rows)=>{
        if(err){
            res.status(500);
            res.send({
                "error": err,
                "events": []
            });
        } 
        else {
            var eventsTimeline = {};

            rows.forEach(function(event){                
                //each row represents the services timelines
                let eventTime = moment.unix(event.time).format(timeFormat);

                if( eventTime in eventsTimeline){
                    eventsTimeline[eventTime] += 1;
                }
                else {
                    eventsTimeline[eventTime] = 1;
                }
            });
            var times = [];
            var counts = [];
            for(var key in eventsTimeline){
                times.push(key);
                counts.push(eventsTimeline[key]);
            }
        
            res.status(200);
            res.send({
                "error": null,
                "timeLines": {
                    "ssh" : {
                        "labels": times,
                        "data": counts
                    }
                }
            });
        }
    });
});

/*              //Alternative method for returning service based timelines
                times = {};
                row.times.split(',').forEach((time)=>{

                    let eventTime = moment.unix(time).format(timeFormat);

                    if(eventTime in times){
                        times[eventTime] += 1;
                    }
                    else {
                        times[eventTime] = 1;
                    }

                    timeLines[row.service] = {
                        "labels": [],
                        "data": []
                    };

                    for(var timeData in times){
                        timeLines[row.service].labels.push(timeData);
                        timeLines[row.service].data.push(times[timeData]);
                    }
                    
                        timeLines = {
                            "ssh": {
                                "labels": ["march 5th, 12:00", ...],
                                "data": [1201, ...]
                            },
                            .
                            .
                            .
                        }
                    
*/


//GET event count by the hour
//this is pretty inefficient...
app.get('/events/chartData', function(req, res) {
    
    res.set({
        'Content-Type': 'application/json'
    });
    //defines the grouing (i.e. by hour, minute, etc)
    var chartData = {
        "password" : {
            "labels": [],
            "data": [],
            "backgroundColor": []
        },
        "username": {
            "labels": [],
            "data": [],
            "backgroundColor": []
        }
    };

    db.serialize(function() {
        db.all(`SELECT username, count(*) as count FROM events 
                WHERE username IS NOT NULL GROUP BY username 
                ORDER BY count DESC LIMIT 25`,function(err, rows){
                    if(!err){
                        rows.forEach(function(row){
                            chartData.username.labels.push(row.username);
                            chartData.username.data.push(row.count);
                            chartData.username.backgroundColor.push(`rgba(${Math.floor(Math.random()*127) + 127}, ${Math.floor(Math.random()*127) + 127}, ${Math.floor(Math.random()*127)+127}, 0.2)`);
                        });
                    }
        });
        db.all(`SELECT password, count(*) as count FROM events
                WHERE password IS NOT NULL GROUP BY password
                ORDER BY count DESC LIMIT 25`, function(err, rows){
                    if(!err){
                        rows.forEach(function(row){
                            chartData.password.labels.push(row.password);
                            chartData.password.data.push(row.count);
                            chartData.password.backgroundColor.push(`rgb(${Math.floor(Math.random()*230) + 15}, ${Math.floor(Math.random()*230) + 15}, ${Math.floor(Math.random()*225)+5})`);
                        });
                        //does serialize garuntee this callback completes *after* the previous?
                        res.send(chartData);
                    }
        });
    }); //end serialize
});


//app kick off!
server.listen(8080);
