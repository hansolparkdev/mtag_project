var mqtt = require('mqtt');
//var fs = require('fs')
//var config = require('../config');
var crypto = require("crypto");
var monitoringDB = require(__dirname + "/../db/monitoringDB");
var socketDB = require(__dirname + "/../db/socketDB");

//var options = {
// 	host: config.mqtt.url,
// 	port: 8883,
// 	protocol: 'mqtts',
// 	protocolId: 'MQIsdp',
//  ca: [fs.readFileSync('certfile/mqtt/ca.crt')],
//  key: fs.readFileSync('certfile/mqtt/client.key'),
//  cert: fs.readFileSync('certfile/mqtt/client.crt'),
//  passphrase: 'mtagwebclient',
//  secureProtocol: 'TLSv1_method',
//  protocolVersion: 3
//}

var client = mqtt.connect('mqtt://127.0.0.1:1883');

function updateMTagPosition(message) {
	try {
		var msg = JSON.parse(message.toString());
		var tag_id = msg.tag_id;
		var beacon_id = msg.beacon_id;
		var rssi = msg.rssi;
		var isEmergency = msg.emergency == 0 ? 0 : 1; //emergency code가 0이 아닌 경우 1을 할당함
		var emergencyCode = msg.emergency // emergency code 할당

		monitoringDB.getInstalledBeacon(beacon_id, function(result) {
			if(!result) {
				console.log("[Error] 입력된 Beacon의 데이터가 없습니다.")
				return;
			}
		});

		if(isEmergency == 0){
		    try {
		        monitoringDB.getEmergencyCode(tag_id, function(result) {
		            if(!result || result.length == 0) {
		                console.log("[Error] No Tag Data.");
		                return;
		            }

		            if(result[0].isEmergency == 1) {
                        isEmergency = result[0].isEmergency;
						emergencyCode = result[0].emergencyCode;
                    }

                    monitoringDB.updateMtagPosition(tag_id, beacon_id, rssi, isEmergency, emergencyCode, function(result) {
						if(result) {
							console.log("[Success] Update MTag Position.")
						} else {
							console.log("[Warning] MTag Position Data Not Updated.")
						}
                    });
                })
		    } catch(exception) {
		        console.log("[Error] Code : " + exception);
		    }
		} else if(isEmergency == 1) {
            monitoringDB.updateMtagPosition(tag_id, beacon_id, rssi, isEmergency, emergencyCode, function(result) {
				if(result) {
					console.log("[Success] Update MTag Position.")
				} else {
					console.log("[Warning] MTag Position Data Not Updated.")
				}
            });
		}
	} catch(exception) {
		console.log("[Error] Code : " + exception);
	}
}

client.subscribe('/gs/mtag/#')
client.subscribe("mtag/mqtt/test")

client.on('connect', function(){
	console.log('mqtt connect');
});

client.on("message", function(topic, message){
	if(topic == 'mtag/mqtt/test') {
		var key = "fsrnt";
		var text = message.toString();

		const decipher = crypto.createDecipher('aes-256-cbc', key);
		let result2 = decipher.update(text, 'base64', 'utf8');
		result2 += decipher.final('utf8')

		let msg = JSON.parse(result2)

		// mqtt로 받은 데이터 복호화
		/****************************************************************************************/
		let tag_id = msg.tag_id
		let beacon_id = msg.beacon_id
		let rssi = msg.rssi
		let emergencyCode = msg.emergencyCode
		/****************************************************************************************/

		let demsg = {"tag_id":tag_id, "beacon_id":beacon_id, "rssi":rssi, "emergencyCode":emergencyCode}

		if(emergencyCode == 1){
			client.publish('mtag/mqtt/test2', emergencyCode);
			socketDB.tagUpdate1(beacon_id, tag_id, function(result){
				console.log("mqtt EC save")
			})
		} else {
			socketDB.tagUpdate2(beacon_id, tag_id, function(result){
				console.log("mqtt save")
			})
		}
	} else if(topic == '/gs/mtag/monitoring') {
		var key = "fsrnt";
		var text = message.toString();

		// mqtt 데이터 복호화
		const decipher = crypto.createDecipher('aes-256-cbc', key);
		let result = decipher.update(text, 'base64', 'utf8');
		result += decipher.final('utf8')
		let msg = JSON.parse(result)

		let tag_id = msg.tag_id
		let beacon_id = msg.beacon_id
		let rssi = msg.rssi
		let emergency = msg.emergency
		
		let demsg = {"tag_id":tag_id, "beacon_id":beacon_id, "rssi":rssi, "emergency":emergency}
		var decryptMessageToJSON = JSON.stringify(demsg)

		updateMTagPosition(decryptMessageToJSON)
	}
});

module.exports.sendDownlinkMessage = function(tag_id, message, callback) {
	var downlinkTopic = '/mtag/in/' + tag_id
	var messageHex = Buffer.from(message, 'utf8').toString('hex')

	var downlinkMessage = {"data":messageHex}
	var sendDownlink = JSON.stringify(downlinkMessage)

	client.publish(downlinkTopic, sendDownlink, function(err) {
		if(err) {
			callback(false)
		} else {
			callback(true)
		}
	})
}

module.exports.sendDownlinkMessageToAll = function(tagsID, message, callback) {
	//length 추출, for loop
	for(var key in tagsID) {
		var messageTopic = '/mtag/in/' + tagsID[key].tag_id
		var messageHex = Buffer.from(message, 'utf8').toString('hex')

		var downlinkMessage = {"data": messageHex}
		var sendDownlink = JSON.stringify(downlinkMessage)

		//전체메시지 보내고 callback ?
		client.publish(messageTopic, sendDownlink, function(err) {
			if(err) {
				console.log(err)
				callback(false)
				return;
			}
			console.log(messageTopic + " => " + sendDownlink)
		})
	}
	callback(true)
}
