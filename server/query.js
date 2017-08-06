var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('events.db');
var moment = require('moment');


// see: https://stackoverflow.com/questions/5522607/how-can-i-do-a-count-distinct-in-sqlite

db.serialize(function() {
	db.run("CREATE TABLE IF NOT EXISTS events (time TEXT, remote_ip TEXT, host_ip TEXT, remote_port TEXT, service TEXT, type TEXT, longitude INTEGER, latitude INTEGER, country_name TEXT, city TEXT, username TEXT, password TEXT, description TEXT)");
 	

	/* return info on each location attacks were launched from
	 db.all("SELECT remote_longitude, remote_latitude, count(case when type='connect' then 1 else null end) as connect_events, count(case when type='password' then 1 else null end) as password_events, service, count(case when type='reverse mapping' then 1 else null end) as mapping_events, count(*) as event_count FROM events GROUP BY remote_latitude, remote_longitude", function(err, rows){
	 		
	 		rows.forEach(function(item){
	 			console.log(item);
	 		});
	 		
 	});
 	*/

 	var eventsByTime = {};

 	db.all("SELECT * FROM events", function(err, rows){
	 		
 			console.log('Rows: ' +  rows.length);
	 		
	 		
	 		
 	});


});


/*
 *  Useful query section
 */ 

/*
console.log('Time: ' + (moment.now() - start) / 1000);


// getting events and grouping them by time
var eventsByTime = {};

 	db.all("SELECT * FROM events", function(err, rows){
	 		
	 		rows.forEach(function(event){
	 			eventTime = moment.unix(event.time).format('YYYY-MM-DD HH:00:00');

	 			eventsByTime[eventTime]
	 		});

	 		
	 		
 	});



	row id isn't returned by default

	remote_longitude, remote_latitude, type, service, count(*)
	group_concat(type) gives the type concatenated with commas

	
	returns all usernames (grouped) and their count
	"SELECT username, count(*) FROM events WHERE username IS NOT NULL GROUP BY username


	returns events grouped by location, and counts the number of each event
	"SELECT remote_longitude, remote_latitude, count(case when type='connect' then 1 else null end) as connect_events, count(case when type='password' then 1 else null end) as password_events, service, count(case when type='reverse mapping' then 1 else null end) as mapping_events, count(*) FROM events GROUP BY remote_latitude, remote_longitude"
*/
