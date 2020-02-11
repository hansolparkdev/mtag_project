var express = require("express");
var db = require(__dirname + "/../db/systemDB");
var bodyParser = require("body-parser");
var ensureAuth   = require(__dirname + "/../services/ensureAuth")
var urlencodedParser = bodyParser.urlencoded({extended : false})
var jsonParser = bodyParser.json();

var router = express.Router();

router.get("/mtag_admin", [ensureAuth], function(req, res) {
	res.render("mtag_admin.html");
});

router.get("/beacon_admin", function(req, res) {
	res.render("beacon_admin.html");
});

router.get("/req_layer", function(req, res) {
	db.getAllLayer(function(result) {
		res.send(result);
	});
});

router.get("/req_map", function(req, res) {
	var layer = req.query.layer;
	db.getMap(layer, function(result) {
		res.send(result);
	});
});

router.get("/getBeaconInfo", function(req, res) {
	var layer = req.query.layer;
	db.getBeaconInfo(layer, function(result) {
		res.send(result);
	});
});

router.get("/getMtagInfo", function(req, res) {
	db.getMtagInfo(function(result) {
		res.send(result);
	});
});

router.put("/updateBeacon", [jsonParser] , function(req, res) {
	var beacon_id = req.body.beacon_id;
	var x = req.body.x;
	var y = req.body.y;
	db.updateBeacon(beacon_id, x, y, function(result) {
		res.send(result);
	});
});

router.get("/addBeacon", function(req, res) {
	var beacon_id = req.query.beacon_id;
	var layer = req.query.layer;
	db.addBeacon(beacon_id, layer, function(result) {
		res.send(result);
	});
});

router.get("/ModifyBeaconInfo",function(req, res) {
	var beacon_id = req.query.beacon_id;
	db.ModifyBeaconInfo(beacon_id, function(result) {
		res.send(result);
	});
});
//수정
router.put("/ModifyBeacon",[jsonParser],function(req, res) {
	var beacon_id = req.body.beacon_id;
	var location = req.body.location;
	var isInstalled = req.body.isInstalled;

	db.ModifyBeacon(beacon_id, location, isInstalled, function(result) {
		res.send(result);
	});
});

router.delete("/deleteBeaconInfo",function(req,res) {
	var beacon_id = req.query.beacon_id;
	db.deleteBeaconInfo(beacon_id, function(result) {
		res.send(result);
	});
});
//1
router.put("/checkInstalled", [jsonParser],function(req, res) {
	var beacon_id = req.body.beacon_id;
	db.checkInstalled(beacon_id, function(result) {
		res.send(result);
	});
});
//0
router.put("/noCheckInstalled", [jsonParser],function(req, res) {
	var beacon_id = req.body.beacon_id;
	db.noCheckInstalled(beacon_id, function(result) {
		res.send(result);
	});
});

router.put("/checkRegistered", [jsonParser],function(req, res) {
	var beacon_id = req.body.beacon_id;
	db.checkRegistered(beacon_id, function(result) {
		res.send(result);
	});
});
//0
router.put("/noCheckRegistered", [jsonParser],function(req, res) {
	var beacon_id = req.body.beacon_id;
	db.noCheckRegistered(beacon_id, function(result) {
		res.send(result);
	});
});

module.exports = router;