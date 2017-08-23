var config = {
    "mapOptions": {
        "type": "map",
        "theme": "light",
        "areasSettings": {
            "unlistedAreasColor": "#8dd9ef"
        },
        "imagesSettings": {
            "color": "#585869",
            "rollOverColor": "#AAB0FF",
            "selectedColor": "#51314F",
            "pauseDuration": 0.2,
            "animationDuration": 2.5,
            "adjustAnimationSpeed": true
        },
        "linesSettings": {
            "color": "#585869",
            "alpha": 0.2
        },
        "export": {
            "enabled": false
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
              "arc": -0.81,
              "alpha": 0.2,
              "latitudes": [],
              "longitudes": []
            }],
            "images": [{
                "id": "animationImage",
                "type": "circle",
                "positionOnLine": 0,
                "color": "#E24438",
                "animateAlongLine": true,
                "lineId": "animationLine",  // this in needed for chart.validateData() to rerender the animation
                "scale": 0.5,
                "positionScale": 1.3,
                "listeners": [{
                    "event": "animationEnd",
                    "method": function(listenerEvent){
                        updateMapEvents(listenerEvent.chart);
                    }
                },
                {
                    "event": "animationStart",
                    "method": function(listenerEvent){
                        //pass
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
        "target": "M9,0C4.029,0,0,4.029,0,9s4.029,9,9,9s9-4.029,9-9S13.971,0,9,0z M9,15.93 c-3.83,0-6.93-3.1-6.93-6.93S5.17,2.07,9,2.07s6.93,3.1,6.93,6.93S12.83,15.93,9,15.93 M12.5,9c0,1.933-1.567,3.5-3.5,3.5S5.5,10.933,5.5,9S7.067,5.5,9,5.5 S12.5,7.067,12.5,9z",
    },
    "colorList": [
        "#E15554",
        "#437ABA",
        "#2E294E",
        "#1B998B",
        "#C5D86D",
        "#F28F3B",
        "#254441",
        "#588B8B",
        "#3FA7AA",
        "#E08DAC",
        "#F1EDEE",
        "#545E75",
    ],
    "socketErrMsg": `<div class="alert alert-danger" id="socket-error">live stream disconnected</div>`
}