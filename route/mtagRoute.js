var express = require("express");
var db = require(__dirname + "/../db/mtagDB");
var bodyParser = require("body-parser");
var ensureAuth   = require(__dirname + "/../services/ensureAuth")
var urlencodedParser = bodyParser.urlencoded({extended : false})
var jsonParser = bodyParser.json();
var crypto = require("crypto");
var key = "fsrnt";
var router = express.Router();

router.get("/", [ensureAuth],  function(req, res) {
	res.render("mtag_admin.html");
});

router.post("/tagAdd",[jsonParser], function(req, res) {
	//var reTag_id = req.body.tag_id;
	//var reTag_name = req.body.tag_name;
	//var reType = req.body.type;
	var tag_id = req.body.tag_id;
	var tag_name = req.body.tag_name;
	var type = req.body.type;

	//tag_id 암호화 
	/****************************************************************************************/
	// const tagIdCipher = crypto.createCipher('aes-256-cbc', key);
	// let tag_id = tagIdCipher.update(reTag_id, 'utf8', 'base64');
	// tag_id += tagIdCipher.final('base64');	
	/****************************************************************************************/

	//tag_name 암호화 
	/****************************************************************************************/
	// const tagNameCipher = crypto.createCipher('aes-256-cbc', key);
	// let tag_name = tagNameCipher.update(reTag_name, 'utf8', 'base64');
	// tag_name += tagNameCipher.final('base64');	
	/****************************************************************************************/

	//type 암호화 
	/****************************************************************************************/
	// const typeCipher = crypto.createCipher('aes-256-cbc', key);
	// let type = typeCipher.update(reType, 'utf8', 'base64');
	// type += typeCipher.final('base64');	
	/****************************************************************************************/

	db.tagAdd(tag_id, tag_name, type, function(result) {
		res.send(result);
	});
});

router.get("/getMtagInfo", function(req, res) {
	
	db.getMtagInfo(function(result) {
		res.send(result);
		// var tt = [];
		// for(var i=0; i < result.length; i++){
			// let reTagId = result[i].tag_id
		 //    let reTagName = result[i].tag_name
		 //    let reType = result[i].type
		    // let reTagId = result[i].tag_id
		    // let reTagName = result[i].tag_name
		    // let reType = result[i].type
		    // let reIsActive = result[i].isActive
		    // let reEmergencyCode = result[i].emergencyCode
		    // let tag_id = result[i].tag_id
		    // let tag_name = result[i].tag_name
		    // let type = result[i].type
    	 //    let isActive = result[i].isActive
		    // let emergencyCode = result[i].emergencyCode

		    //tag_id 복호화
			/****************************************************************************************/
			// const deTagIdcipher = crypto.createDecipher('aes-256-cbc', key);
			// let tag_id = deTagIdcipher.update(reTagId, 'base64', 'utf8');
			// tag_id += deTagIdcipher.final('utf8')
			/****************************************************************************************/
			
			//tag_name 복호화
			/****************************************************************************************/
			// const deTagNamecipher = crypto.createDecipher('aes-256-cbc', key);
			// let tag_name = deTagNamecipher.update(reTagName, 'base64', 'utf8');
			// tag_name += deTagNamecipher.final('utf8')
			/****************************************************************************************/

			//type 복호화
			/****************************************************************************************/
			// const deTypecipher = crypto.createDecipher('aes-256-cbc', key);
			// let type = deTypecipher.update(reType, 'base64', 'utf8');
			// type += deTypecipher.final('utf8')
			/****************************************************************************************/

			//isActive 복호화
			/****************************************************************************************/
			// const deIsActivecipher = crypto.createDecipher('aes-256-cbc', key);
			// let isActive = deIsActivecipher.update(reIsActive, 'base64', 'utf8');
			// isActive += deIsActivecipher.final('utf8')
			/****************************************************************************************/

			//emergencyCode 복호화
			/****************************************************************************************/
			// const deEmergencyCodecipher = crypto.createDecipher('aes-256-cbc', key);
			// let emergencyCode = deEmergencyCodecipher.update(reEmergencyCode, 'base64', 'utf8');
			// emergencyCode += deEmergencyCodecipher.final('utf8')
			/****************************************************************************************/

			// console.log(tag_id)
			// console.log(tag_name)
			// console.log(type)
			// console.log(isActive)
			// console.log(emergencyCode)

			// test = {"tag_id":tag_id, "tag_name":tag_name, "type":type, "isActive":isActive, "emergencyCode":emergencyCode};
			// tt.push(test)
			// let test1 = JSON.parse(test)
			
		// }
		// res.send(result);
	});
});

router.get("/ModifyTagInfo",function(req, res) {
	var tag_id = req.query.tag_id;
	db.ModifyTagInfo(tag_id, function(result) {
		res.send(result);
	});
});

router.delete("/deleteTag",function(req, res) {
	var tag_id = req.query.tag_id;
	db.deleteTag(tag_id, function(result) {
		res.send(result);
	});
});

router.put("/ModifyTag",[jsonParser],function(req,res) {
	var tag_id = req.body.tag_id;
	var tag_name = req.body.tag_name;
	var type = req.body.type;

	db.ModifyTag(tag_id, tag_name, type, function(result) {
		res.send(result);
	});
});

router.get("/getTempInfo", function(req, res) {
	var layer = req.qurey.layer;
	db.getTempInfo(function(result){
		res.send(result);
	});
});

router.get("/StatusTagInfo", function(req,res) {
	var tag_id = req.query.tag_id;
	db.getTagStatus(tag_id, function(result) {
		res.send(result);
	});
})

module.exports = router;