var express = require('express');
var db = require(__dirname + "/../db/loginDB");
var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
var crypto = require("crypto")
var passport   = require(__dirname + "/../services/passport")
var signAuth   = require(__dirname + "/../services/signAuth")
var ensureAuth   = require(__dirname + "/../services/ensureAuth")
var urlencodedParser = bodyParser.urlencoded({extended : false})
var router = express.Router();

var sessionDB = require(__dirname + "/../db/loggedSessionDB")

/* GET home page. */
router.get('/', [signAuth], function(req, res, next) {
	var fmsg = req.flash();
	db.checkChangePassword(function(result){
		var status = result[0].status;
		if(fmsg){
			res.render('login.html', {"status":status, "fmsg":fmsg.error});
		}else{
			res.render('login.html', {"status":status, "fmsg":fmsg.error});
		}
	})
});

router.post("/signin", [urlencodedParser,passport.authenticate('local', {failureRedirect: '/login', failureFlash:true})], function(req, res){
	var userID = req.body.userId

	req.session.userID = userID
	req.session.sessionID = req.sessionID
	req.session.save(function(err) {
		//session search and delete. complete -> going to main page
		sessionDB.insertLoginID(req.sessionID, userID, function(result) {
			if(!result) {
				console.log("[Error] Data Insert Error")
			}
		})

		res.redirect('/main');
	});
})

router.post("/logout",[urlencodedParser], function(req, res){
	res.clearCookie('connect-sid')
	req.session.destroy(function(err){
		res.redirect("/login/")
	});
})

router.get("/autoLogout", function(req, res) {
	res.clearCookie('connect-sid')
	req.session.destroy(function(err) {
		res.redirect("/login/")
	})
})

router.post("/check_temporary_code", [jsonParser], function(req, res){
	var temporary_code = req.body.temporary_code;
	db.checkTemporaryCode(temporary_code, function(result){
		res.send(result)
	})
})

router.post("/changepwd", [urlencodedParser], function(req, res){
	var npwd = req.body.npwd;
	var cpwd = req.body.cpwd;
	var status = req.body.status;
	
	db.ChangePwd(npwd, cpwd, function(result){
		if(!result) {
			res.render('login.html', {"status" : status, "fmsg": "비밀번호 변경에 실패했습니다."})
		}else {
			res.render('login.html', {"status" : status, "fmsg": "비밀번호 변경 성공! 신규 비밀번호로 로그인해주세요."})
			//res.redirect('/login/')
		}
	})
})

router.get("/currentLoginID", function(req, res) {
	sessionDB.currentLoginID(function(result) {
		if(result[0].session_id != req.session.sessionID) {
			res.send(false)
			return
		}

		res.send(true)
	})
})

module.exports = router;
