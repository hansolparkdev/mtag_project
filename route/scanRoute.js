var express = require("express");
var db = require(__dirname + "/../db/scannerDB");
var router = express.Router();

var count = 0;

router.get("/", function(req, res) {
    count = count + 2;

    if (count > 80) {
        count = 2;
    }

	//db.getScannerData(function(result) {
	db.getScannerDumpData(count, function(result) {
		var data = {"items":result};
		res.send(data);
	});
});

module.exports = router;
