var mqtt = require("mqtt");
var client = mqtt.connect('mqtt://1.234.51.99:9005', {
	username:"fsrnt",
	password:"75657565"
});

client.on("connect", function() {
	console.log("mqtt connect")
});

// client.publish("/soosang/mtag/test", '{"beacon_id":"00000003", "from_layer":"2", "layer":"1"}')

//100 -100
// 00012779  2
//  00012796 1
client.publish('mtag/mqtt/test', '{"tag_id":"013157F3", "beacon_id":"00012796","rssi":"70","emergencyCode":"0"}');

// client.publish('mtag/mqtt/test', '{"tag_id":"'+mtag_list[0]+'", "beacon_id":"'+beacon_list[Math.floor(Math.random() * 4)]+'","rssi":"","emergencyCode":""}');
// module.exports.start = function(){
	
// }