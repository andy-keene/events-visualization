# events-visualization
events-visualization was a project built for a full stack web development class. The goal of this project, beyond expirementing with javascript, was 
to visualizate the prevelence of network-based brute force attacks to those who may not be familiar with them. Additionally, with further analysis trends may be identified. 

The architecture of the project can be summarized in three parts:
- **The honeypot** runs a modified version of openSSH which records attempted logins, including username and password combinations. A python script then 
parses and POSTs this data to the web server.
- **The web server**, running NodeJS, stores all event data in the SQLite database, emits the events to connected sockets for live-streaming, serves both dynamic and static html pages, and retrieves the appropriate data for GET requests.
- **The client** simply uses AJAX calls and socket streams to retrieve formatted event data for the visualizations. The visualizations include: a geographic plot of where events originated from (live streamed), a log of all events originating from a specified location, a timeline of total events, and a chart of the most common attempted login credentials. 

Example pages:
???

## Instructions

### HoneyPot
1. Prerequisite: `gcc`, `virtualenv`, `python3`
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
1. Run the application using `forever start app.js`. This allows the app to be restarted on failure. Likewise `forever stop <app-id>` can be used to temporarily stop the server inbetween updates.


## Config notes
To block IPs via IP tables, use the following command:
`sudo iptables -I INPUT -s <ip> -p tcp --dport ssh -j REJECT`

## Resources/credit:
- https://github.com/mapbox/node-sqlite3/wiki/API
- https://github.com/wedaa/LongTail-Log-Analysis
- https://docs.amcharts.com/3/javascriptmaps
- https://www.tecmint.com/block-ssh-and-ftp-access-to-specific-ip-and-network-range/
- https://datatables.net/download/


###General todo:
- save SSH setup in github
- fix parser bug on empty password :(
- need host information in geolocation! Ugh...
- update timeline to hndle timelines for all events\
Lessons learned:
- naming conventions across languages. Naming the post data in python kind of killed the cohesive style for js