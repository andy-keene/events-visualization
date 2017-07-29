import re
import requests
import json
from datetime import datetime
from sh import tail

'''
POST data should be of the form:
	{	
		## REQUIRED ## 
		'time' : <given as epoch>
		'remote_ip' : 	
		'host_ip' :
		'service': <ssh, telnet, http, ...>
		'type': <vector of attack, i.e. user/pass, reversemapping, etc...>
		'longitude': <longitude coordinates>
		'latitude': <latitiude coordinates>

		## OPTIONAL ##
		'remote_port' : 
		'local port' : 
		'username' : 
		'password' :
		'client_specs' :
		'other' :

		... more from geo ip lookup (i.e. region, country, etc..)
		'city': <city>
		'region_name': <region>
	}

Here are the log entries we are looking for:

	Jul 17 22:34:11 honeypy sshd-22[8837]: IP: 131.252.50.27 PassLog: Username: keene Password: kmkm
	Jul 17 22:36:57 honeypy sshd-22[8866]: Attack From: 101.207.248.14; Client protocol version 2.0; client software version libssh2_1.8.1-20170115; Remote port: 
	54538; Local port: 22
	Jul 17 05:33:17 honeypy sshd[1306]: reverse mapping checking getaddrinfo for 119.164.117.124.broad.wl.xj.dynamic.163data.com.cn [124.117.164.119] failed - POSSIBLE BREAK-IN ATTEMPT!
'''


'''
	Splits log-line to return details of attack (information outside of the time stamp)
	on success: returns 'Connection closed by...' from 'Jul 17 22:38:56 honeypy sshd-22[8892]: Connection closed'
	on failure: returns None
'''
def split_line(line):
	#simple rexex to match on the [ppid] element of the log
	split_regex = re.compile("\[\d+\]: ")
	split_line = split_regex.split(line)
	if(not split_line):
		return None
	else:
		return split_line[-1]


'''
	Given a string of attack details, such as Attack From: 101.207.248.14, retrurns a 
	dictionary of all attack details - both required and optional (*see specs at file header).
	Must be a valid line according to program header above.
	on success: returns a dicitonary of attack details, inclucing geo_ip information
	on failure: returns {}
'''
def map_event(line):
	
	#initial key-values
	event = {
		'time': datetime.now().timestamp(),
		'service': 'ssh',
	}

	if line.startswith('Attack From'):
		# example, Attack From: 131.252.50.27; Client protocol version 2.0; client software version OpenSSH_7.4; Remote port: 50597; Local port: 22
		raw_event = line.split(' ')
		event['remote_ip'] = raw_event[2]
		event['local_port'] =  raw_event[16]
		event['remote_port'] =  raw_event[13]
		event['protocol_specs'] = 'protocol version {} client software{}'.format(raw_event[6], raw_event[10])
		event['type'] = 'connect'
	elif line.startswith('IP'):
		# example, IP: 131.252.50.27 PassLog: Username: keene Password: kmkm
		raw_event = line.split(' ')
		event['remote_ip'] = raw_event[1]
		event['username'] = raw_event[4]
		#event['password'] = raw_event[6] if len(raw_event) > 6 else ' '
		#password could be raw
		event['password'] = line.split('Password: ')[-1]
		event['type'] = 'password'
	elif line.startswith('reverse mapping checking'):
		# example, reverse mapping checking getaddrinfo for host-79-165-2-209.qwerty.ru [79.165.2.209] failed ...
		raw_event = line.split(' ')
		event['remote_ip'] = re.sub('[\[\]]', '', raw_event[6])
		event['other'] = raw_event[5]
		event['type'] = 'reverse mapping'
	else:
		print('** details: {}\n'.format(_details))
		return {}

	# return all data if geo lookup was a success
	_remote_data = get_geo_data(event['remote_ip'], 'remote')
	if _remote_data != {}:
		event.update(_remote_data)
		return event
	else:
		return {}


'''
	get geographic data from freegeoip.net/{format}/{IP_or_hostname} for the given IP
	*note, given <location> must be 'remote' or 'host'
	*note, it uses prepends 'host', 'remote' to the ip, longitidue, and

	returns {'ip' : <ip>, 'city': <city>, 'country', ... }
	returns {} on failure 
'''
def get_geo_data(ip, location):
	event = {}
	try:
		#get geographic data from freegeoip.net/{format}/{IP_or_hostname}
		response = requests.get(url='http://www.freegeoip.net/json/{}'.format(ip))
		if response.status_code == 200:
			#prepends 'host_' or 'remote_' to each key on success
			for key, value in dict(response.json()).items():
				event[location + '_' + key] = value
	except Exception as err:
		print('Exception in get_geo_data(): {}\nResponse: {}'.format(err, response.text))
	# return empty dict on failure to lookup/thrown exception
	return event


'''
	iterates over log lines in tail -f like fashion
	posts all relevant attack information to the data store
'''
def main():
	## FILL IN DATA ##
	host_ip = 'XXX.XX.XXX.XXX'
	app_url = 'XXX.XXX.XX:8080/event'
	log_file = '/var/log/auth.log'

	host = get_geo_data(host_ip, 'host')
	host_data = {
		'host_ip': host['host_ip'],
		'host_longitude': host['host_longitude'],
		'host_latitude': host['host_latitude']
	}

	for line in tail('-f', log_file, _iter=True):
		# avoid wasting resources on invalid lines
		if 'IP' not in line and 'Attack from' not in line and 'reverse mapping' not in line:
			continue
		#strip endlines and split
		line = line.replace('\n','')
		details = split_line(line)
		if not details:
			continue

		# map raw data to a JSON post and deliver to data store (don't forget host data)
		event = map_event(details)
		if event != {}:
			event.update(host_data)
			try:
				resp = requests.post(url=app_url, data=json.dumps(event), headers={'Content-Type': 'application/json'})
			except Exception as e:
				print('Error sending payload to server\nPOST Body:{}\nException:{}'.format(event, e))

if __name__ == '__main__':
	main()
