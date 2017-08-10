## Resources:
- https://github.com/mapbox/node-sqlite3/wiki/API
- https://github.com/wedaa/LongTail-Log-Analysis
- https://docs.amcharts.com/3/javascriptmaps


# events-visualization
CS 400 project for visualization network events

Todo:
		- download and write script
		- add info box
		- up max tries for password attempts


General todo:
		- save SSH setup in github
		- setup charting library / bootstrap for local use!
		- stream event data better from event server (currently crashing)
		- downgrade app.js instance?
		- fix parser bug on empty password :(
		- use pre tags in logs to prevent XSS
		- need host information in geolocation! Ugh...

If time allows:
		- update timeline to hndle timelines for all events


Lessons learned:
		- naming conventions across languages. Naming the post data in python kind of killed the cohesive style for js



Ideas for drawing:
- Batch in increments of 5minutes/30 minutes/ etc
- Delay start like the 'hack', and see about adding images mid draw?



### Instructions

Run the app using `forever start app.js` this allows the app to be restarted on failure. Likewise `forever stop <app-id>` can be used to temporarily stop the server inbetween updates.

To start the honeypot parser type `nohup python parse.py &`. You can verify the SSH parser is running with `ps -aux | grep <username>` and look for the lines containing `tail -f` and `parse.py` to confirm the whole process is running.

Connect to the honeypot over port listed in the `-22` config file (i.e. port 48000). If the honeypot restarts, the following commands need to be rerun to reconnect the daemons on the appropriate ports:
`sudo /usr/local/sbin/sshd-22 -f /usr/local/etc/sshd_config-22`
`sudo /usr/local/sbin/sshd-2222 -f /usr/local/etc/sshd_config-2222`


### Leftoff
- Writing queries for individual coordinates. Instead of writing all the stuff to the description box, maybe add a count of events and then a link to download a page with full details drilling down that ip.
- figure out if the map can even handle the full data and add in filters if not
- need to finish bootstrap page and get ideas for general layout.
