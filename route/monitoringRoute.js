var express = require("express");
var db = require(__dirname + "/../db/monitoringDB");
var mqtt = require(__dirname + "/../services/mqttService")
var bodyParser = require("body-parser");
var ensureAuth   = require(__dirname + "/../services/ensureAuth")
var urlencodedParser = bodyParser.urlencoded({extended : false})
var jsonParser = bodyParser.json();

var router = express.Router();

router.get("/", [ensureAuth], function(req, res) {
	res.render("monitoring.html");
});
router.get("/test", function(req, res){
	res.render("monitoring2.html")
})
router.get("/beacon_admin", function(req, res) {
	res.render("beacon_admin.html");
});

router.get("/req_layer", function(req, res) {
	db.getAllLayer(function(result) {
		res.send(result);
	});
});

router.get("/getLocation", function(req, res){
	var beacon_id = req.query.beacon_id;
	db.getLocation(beacon_id, function(result){
		res.send(result)
	})
})
router.get("/req_map", function(req, res) {
	var layer = req.query.layer;
	db.getMap(layer, function(result) {
		res.send(result);
	});
});

router.get("/getMonitoringInfo", function(req, res) {
	var layer = req.query.layer;
	db.getMonitoringInfo(layer, function(result) {
		res.send(result);
	});
});

router.get("/getMtagPosition", function(req, res) {
	var layer = req.query.layer;
	db.getMtagPosition(layer, function(result) {
		res.send(result);
	});
});

router.get("/getMtagInfo", function(req, res) {
	var beacon_id = req.query.beacon_id;
	db.getMtagInfo(beacon_id, function(result) {
		res.send(result);
	});
});

router.get("/getTagCount", function(req, res) {
	var layer = req.query.layer;
	db.getTagCount(layer, function(result) {
		res.send(result);
	});
});

router.get("/getTempInfo", function(req, res) {
	var layer = req.query.layer;
	db.getTempInfo(function(result) {
		res.send(result);
	});
});

router.get("/getEmergencyCount", function(req, res) {
    db.getEmergencyCount(function(result){
        res.send(result);
    });
});

router.get("/getEmergencyInfo", function(req, res) {
    db.getEmergencyInfo(function(result) {
        res.send(result);
    });
});

router.put("/tagEmergencyRelease",[jsonParser],function(req,res) {
	var tag_id = req.body.tag_id;

	db.tagEmergencyRelease(tag_id, function(result) {
		res.send(result);
	});
});

router.post("/tagSendMessage", [jsonParser], function(req, res) {
	var tag_id = req.body.tag_id
	var message = req.body.message

	mqtt.sendDownlinkMessage(tag_id, message, function(result) {
		res.send(result)
	})
})

router.get("/getEnableTagsID", function(req, res) {
	db.getEnabledTagsID(function(result) {
		res.send(result)
	})
})

router.post("/tagSendNoticeToAll", [jsonParser], function(req, res) {
	var tagsID = req.body.tagsID
	var message = req.body.message

	mqtt.sendDownlinkMessageToAll(tagsID, message, function(result) {
		res.send(result)
	})
})

//new_monitoring

module.exports = router;
