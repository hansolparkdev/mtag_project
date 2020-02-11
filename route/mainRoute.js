var express = require("express");
var bodyParser = require("body-parser");
var ensureAuth   = require(__dirname + "/../services/ensureAuth")
var urlencodedParser = bodyParser.urlencoded({extended : false})
var db = require(__dirname + "/../db/mainDB");
var router = express.Router();

router.get("/", [ensureAuth], function(req, res) {
	res.render("main.html");
});

router.get("/getOnBoardInfo", function(req, res) {
	db.getOnBoardInfo(function(result) {
		res.send(result);
	});
});

router.get("/getTagInfo", function(req, res) {
	db.getTagInfo(function(result) {
		res.send(result);	
	});
});

router.get("/getBeaconInfo", function(req, res) {
	db.getBeaconInfo(function(result) {
		res.send(result);
	});
});
module.exports = router;