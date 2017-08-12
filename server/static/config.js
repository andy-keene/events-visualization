var config = {
	"mapOptions": {
		"type": "map",
		"theme": "light",
		"areasSettings": {
			"unlistedAreasColor": "#8dd9ef"
		},
		"imagesSettings": {
			"color": "#585869",
			"rollOverColor": "#FF5869",
			"selectedColor": "#585869",
			"pauseDuration": 0.2,
			"animationDuration": 2.5,
			"adjustAnimationSpeed": true
		},
		"linesSettings": {
			"color": "#585869",
			"alpha": 0.4
		},
		"export": {
			"enabled": true
		},
		"listeners": [{
			"event": "init",
			"method": function(listenerEvent){
				console.log('init handler called');
			}
		}],
		"dataProvider": {
			"map": "worldLow",
			"lines": [{
		      "id": "animationLine",
		      "arc": -0.85,
		      "alpha": 0.3,
		      "latitudes": [],
		      "longitudes": []
		    }],
			"images": [{
		    	"id": "animationImage",
		      	"svgPath": `m47.304248,31.588526l-3.694258,-0.099177l0.099855,3.669162c0.099855,5.950039 5.092134,10.809228 11.082868,11.007582l3.694258,0.099177l-0.099855,-3.669162c-0.199806,-5.950039 -5.092229,-10.908405 -11.082868,-11.007582z`,
		     	"positionOnLine": 0,
		      	//"color": "#585869",
		      	"animateAlongLine": true,
		      	"lineId": "animationLine",	// this in needed for chart.validateData() to rerender the animation
		      	"scale": 0.5,
		      	"positionScale": 1.3,
		      	"listeners": [{
					"event": "animationEnd",
					"method": function(listenerEvent){
						console.log('animationFinished called in line');
						updateMapEvents(listenerEvent.chart);
					} 
				},
				{
					"event": "animationStart",
					"method": function(listenerEvent){
						console.log('animationStart called in line');
					}
				}]
			}]
		}, // end data provider			
	},
	"serviceColors": {
		"telnet": "#2E696A",
		"ssh": "#626AD2"
	},
	"svgs": {
		"plane": "M9,0C4.029,0,0,4.029,0,9s4.029,9,9,9s9-4.029,9-9S13.971,0,9,0z M9,15.93 c-3.83,0-6.93-3.1-6.93-6.93S5.17,2.07,9,2.07s6.93,3.1,6.93,6.93S12.83,15.93,9,15.93 M12.5,9c0,1.933-1.567,3.5-3.5,3.5S5.5,10.933,5.5,9S7.067,5.5,9,5.5 S12.5,7.067,12.5,9z",
		"target": "m2,106h28l24,30h72l-44,-133h35l80,132h98c21,0 21,34 0,34l-98,0 -80,134h-35l43,-133h-71l-24,30h-28l15,-47",
	},

	"funcGenerateDescription":
	    function generateDescription(event, isHost){
	    	return `
	    		   <div style="font-size:small;">
				   <b>Service</b>: ${event.services}<br>
				   <b>Number of events:</b> ${event.total_events}<br>
				   See more events originating from this location <a href="/event?longitude=${event.remote_longitude}&latitude=${event.remote_latitude}" target="_blank">here</a>
				   </div>
				 `;
	    },
}