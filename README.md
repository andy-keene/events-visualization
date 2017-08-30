# events-visualization
events-visualization was a project built for a full stack web development class. The goal of this project, beyond expirementing with javascript, was 
to visualize the prevelence of network-based brute force attacks for those who may not be familiar with them. Additionally, with further analysis trends may be identified. 

The architecture of the project can be summarized in three parts:
- **The honeypot** runs a modified version of openSSH which records attempted logins, including username and password combinations. A python script then 
parses and POSTs this data to the web server.
- **The web server**, running NodeJS, stores all event data in the SQLite database, emits the events to connected sockets for live-streaming, serves both dynamic and static html pages, and retrieves the appropriate data for GET requests.
- **The client** simply uses AJAX calls and socket streams to retrieve formatted event data for the visualizations. The visualizations include: a geographic plot of where events originated from (live streamed), a log of all events originating from a specified location, a timeline of total events, and a chart of the most common attempted login credentials. 

## Screenshots
1. _geographic plot of unique locations where attacks originate from (with live stream of events)_
![screen shot 2017-08-28 at 12 21 26 pm](https://user-images.githubusercontent.com/20017363/29888729-c5e0fcba-8d76-11e7-8e31-1358c0720e10.png)

1. _drill down on an attack location_
![screen shot 2017-08-28 at 12 20 45 pm](https://user-images.githubusercontent.com/20017363/29888750-d2398bb2-8d76-11e7-9c4e-5aec1775df61.png)

1. _pop up link from drill down showing last 8000 events from the specified location_
![screen shot 2017-08-28 at 12 32 09 pm](https://user-images.githubusercontent.com/20017363/29888811-f26f984a-8d76-11e7-93fb-c7e36865aab8.png)

1. _timeline, by day, of number of events_
![screen shot 2017-08-28 at 12 21 36 pm](https://user-images.githubusercontent.com/20017363/29888806-efe2930c-8d76-11e7-88eb-8df2861a5886.png)

1. _login attempts showing the top 10 attempted usernames and top 10 attempted passwords_
![screen shot 2017-08-28 at 12 22 59 pm](https://user-images.githubusercontent.com/20017363/29888741-cd32bad0-8d76-11e7-9327-55aac3511bee.png)

1. _login attempts table showing the top 7000 most commin username and password combinations_
![screen shot 2017-08-28 at 12 23 32 pm](https://user-images.githubusercontent.com/20017363/29888769-dc0559aa-8d76-11e7-9f21-633f9ce0ab73.png)


## Instructions

### HoneyPot
1. Prerequisites: `gcc`, `virtualenv`, `python3`
1. Navigate to `/honeypot/ssh` and run `sudo bash install_openssh.sh`. This will both download and install the modifed version of openSSH - 
1. Edit the line from `Port 22` to `Port 48000` in the systems SSH configuration (`/etc/ssh/sshd_config`). This will be the port you login to, as authentication on port 22 will be blocked.
1. Restart the `sshd` daemon with `sudo service restart ssh` and run `sudo /usr/local/sbin/sshd-22 -f /usr/local/etc/sshd_config-22` `sudo /usr/local/sbin/sshd-2222 -f /usr/local/etc/sshd_config-2222` to bind each sshd instance with the appropriate configuration.
1. After verifying the honeypot server can still be accessed over port 48000 and that attempted logins over port 22 are recordered, the parser may be started. First fill in the `host_ip` with the honeypots IP, and the `app_url` with the endpoint of the node application in `main()` of `bin/parser.py`
1. Create a python virtual environment with `virtualenv -p python3 venv` and `source venv/bin/activate`
1. Install the python requirements with `pip install -r requirements.txt`
1. The parser may then be started with `nohup python parse.py &`. Note that this script running is imperfect if it is terminated it will not restart without manual intervention.

You can verify the SSH parser is running with `ps -aux | grep <username>` and look for the lines containing the program names`tail -f` and `parse.py` to confirm the entire process is running.

Connect to the honeypot over port listed in `sshd_config`(i.e. port 48000). If the honeypot restarts, the parser will need to be restarted and the following commands must be rerun to reconnect the daemons on the appropriate ports:
`sudo /usr/local/sbin/sshd-22 -f /usr/local/etc/sshd_config-22`
`sudo /usr/local/sbin/sshd-2222 -f /usr/local/etc/sshd_config-2222`


### Web Server
1. Prerequisites: `Forever`, `node`
1. From `/server` install the dependencies with `npm install`
1. Run the application on port 8080 using `forever start app.js`. This allows the app to be restarted on failure. Likewise `forever stop <app-id>` can be used to temporarily stop the server inbetween updates.

### Config notes
To block IPs via IP tables, use the following command:
`sudo iptables -I INPUT -s <ip> -p tcp --dport ssh -j REJECT`

## Resources/credit:
- https://github.com/mapbox/node-sqlite3/wiki/API
- https://github.com/wedaa/LongTail-Log-Analysis
- https://docs.amcharts.com/3/javascriptmaps
- https://www.tecmint.com/block-ssh-and-ftp-access-to-specific-ip-and-network-range/
- https://datatables.net/download/
