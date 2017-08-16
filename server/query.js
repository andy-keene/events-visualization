var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('events.db');
var moment = require('moment');


// see: https://stackoverflow.com/questions/5522607/how-can-i-do-a-count-distinct-in-sqlite

db.serialize(function() {
	db.run("CREATE TABLE IF NOT EXISTS events (time TEXT, remote_ip TEXT, host_ip TEXT, remote_port TEXT, service TEXT, type TEXT, host_longitude INTEGER, host_latitude INTEGER, remote_longitude INTEGER, remote_latitude INTEGER, remote_country_name TEXT, remote_city TEXT, username TEXT, password TEXT, description TEXT)");

	var timeFormat = 'YYYY-MM-DD HH:00:00';

   	var yesterday = moment().utc().add(-10, 'days').valueOf() / 1000;

   	var stmt = db.prepare(`SELECT * FROM events WHERE time > ?`);
	stmt.all(yesterday, (err, rows)=>{
        if(err){
			console.log('err: ' + err);
		}
		else {
			rows.forEach((row)=>{
				console.log(moment.unix(row.time).format(timeFormat));
			})
			console.log('rows: ' + rows.length);

		}
	});

	
	


});


/*
 *  Useful query section
 */ 



/*


db.all(`SELECT GROUP_CONCAT(time) as times, service FROM events
             GROUP BY service`, (err, rows)=>{
        if(err){
			console.log('err: ' + err);
		}
		else {
			var timeFormat = 'YYYY-MM-DD HH:00:00';
			timeLines = {};
			rows.forEach(function(row){
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
			 		
				});
			});
			console.log(timeLines);
			//console.log(rows.length + ' \n' + rows);
		}
	});





var eventsTimeline = {};
			rows.forEach(function(event){
                if(!event.service in eventsTimeline){
                    eventsTimeLine[event.service] = {
                        "labels": [],
                        "count": []
                    }
                }
                //each row represents the services timelines
	 			let eventTime = moment.unix(event.time).format(timeFormat);

	 			if( eventTime in eventsByTime[event.service]){
	 				eventsByTime[event.service][eventTime] += 1;
	 			}
	 			else {
	 				eventsByTime[event.service][eventTime] = 1;
	 			}
	 		});







// return info on each location attacks were launched from
	 db.all("SELECT remote_longitude, remote_latitude, count(case when type='connect' then 1 else null end) as connect_events, count(case when type='password' then 1 else null end) as password_events, service, count(case when type='reverse mapping' then 1 else null end) as mapping_events, count(*) as event_count FROM events GROUP BY remote_latitude, remote_longitude", function(err, rows){



//parameterized insert
//'keys need to be prepended with $'
 	var event = {"time":"1501378559.64584","remote_ip":"51.211.200.161","host_ip":"35.193.37.216","remote_port":"","service":"ssh","type":"password","host_longitude":-122.0574,"host_latitude":37.4192,"remote_longitude":45,"remote_latitude":25,"remote_country_name":"Saudi Arabia","remote_city":"","username":"root","password":"ANDY IS TESTING","description":"null"}

	db.run(`INSERT INTO events (
			time, remote_ip, host_ip, remote_port, 
			service, type, host_longitude, host_latitude, 
			remote_longitude, remote_latitude, remote_country_name, 
			remote_city, username, password, description) 
			VALUES (
			$time, $remote_ip, $host_ip, $remote_port, 
			$service, $type, $host_longitude, $host_latitude, 
			$remote_longitude, $remote_latitude, $remote_country_name, 
			$remote_city, $username, $password, $description)`, event);


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
