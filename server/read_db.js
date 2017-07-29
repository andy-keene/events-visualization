var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('events.db');


db.serialize(function() {
	db.run("CREATE TABLE IF NOT EXISTS events (time TEXT, remote_ip TEXT, host_ip TEXT, remote_port TEXT, service TEXT, type TEXT, longitude INTEGER, latitude INTEGER, country_name TEXT, city TEXT, username TEXT, password TEXT, description TEXT)");
 	

	//row id isn't returned by default
	 db.all("SELECT * FROM events", function(err, rows){
	 		keys = Object.keys(rows[0]);
	 		console.log(keys.join(',\t'))
	 		for(i = 0; i < rows.length; i++){
	 			console.log(Object.values(rows[i]).join(',\t'));
	 		}
 });


});