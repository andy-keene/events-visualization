## Resources:
- https://github.com/mapbox/node-sqlite3/wiki/API
- https://github.com/wedaa/LongTail-Log-Analysis
- https://docs.amcharts.com/3/javascriptmaps


# events-visualization
CS 400 project for visualization network events

Todo:
		- Checkout clock for showing 24 hour? cycle
		- checkout different themes
		- solve time delay problem (see closure, or data{} in slides)
		- start writing functions for each element (mapping time, etc.)
		- download and write script
		- add info box
		- up max tries for password attempts


	General todo:
		- save SSH setup in github
		- setup charting library / bootstrap for local use!
		- stream event data better from event server (currently crashing)
		- downgrade google cloud instances

	** clean up code below (you can do concurrent attacks )

	port 48000

	These cmds on the honey may need to be run again:
	(venv)keene@honeypy:~$ sudo /usr/local/sbin/sshd-22 -f /usr/local/etc/sshd_config-22
	(venv)keene@honeypy:~$ sudo /usr/local/sbin/sshd-2222 -f /usr/local/etc/sshd_config-2222
	https://github.com/wedaa/LongTail-Log-Analysis


Ideas for drawing:
- Batch in increments of 5minutes/30 minutes/ etc
- Delay start like the 'hack', and see about adding images mid draw?



### Instructions

Run the app using `forever start app.js` this allows the app to be restarted on failure. Likewise `forever stop <app-id>` can be used to temporarily stop the server inbetween updates.

To start the honeypot type `nohup python parse.py &`. You can verify the SSH parser is running with `ps -aux | grep <username>` and look for the lines containing `tail -f` and `parse.py` to confirm the whole process is running.


### Leftoff
- Writing queries for individual coordinates. Instead of writing all the stuff to the description box, maybe add a count of events and then a link to download a page with full details drilling down that ip.
- figure out if the map can even handle the full data and add in filters if not
- need to finish bootstrap page and get ideas for general layout.
