var passport = require("passport")
var crypto = require("crypto")
var LocalStrategy = require("passport-local").Strategy;
var db = require(__dirname + "/../db/loginDB")
var key = "z$C&F)H@McQfTjWn6v9y$B&E)H+MbQeTp2s5v8y/B?E(H+KbUjXn2r5u8x/A?D(GcQfTjWnZr4u7x!A%";
const init_pwd = "P@ssw0rd";
						
passport.use(new LocalStrategy({
	usernameField : "userId",
	paswordField : "password",
	passReqToCallback: true
	}
	, function(req, userId, password, done){
		if(userId == undefined || userId == "" || password == undefined || password == ""){
			return done(null, false, {message : '아이디 혹은 비밀번호를 입력하지 않았습니다.'});
		}
		var psw = password
		db.information(userId, function(result, password, status){
			if(result){
				var decipher = crypto.createDecipher('aes256', key);
			   	var dc = decipher.update(password, 'base64', 'utf8');
				var decipheredOutput = dc + decipher.final('utf8');

			   	if(psw == decipheredOutput){
					if(psw == init_pwd) {
						return done(null, false, {message:"최초로 로그인 하셨습니다. 비밀번호를 재설정해주세요."})
					}else if(status == 0) {	
						user = {"user_id": userId}
						db.initErrPwd(function(result2){
							return done(null, user);
						})
					} else {
						return done(null, false, {message:"비밀번호를 재설정해주세요."})
					}
			   	} else {
					db.countUpPwdError(function(errCount){
						if(errCount[0].pwd_err_count == 5){
							var cipher = crypto.createCipher('aes256', key);
							var pwd = cipher.update(init_pwd, 'utf8', 'base64');
							pwd += cipher.final('base64');
							db.initPassword(pwd, function(result3){
								return done(null, false, {message:"사용자 정보를 5회 이상 잘못 입력하여 정보가 초기화 되었습니다. 비밀번호를 재설정해주세요."})
							})
						}else if(errCount[0].pwd_err_count > 5) {
							return done(null, false, {message:"사용자 정보를 5회 이상 잘못 입력하셔서 정보가 초기화 되었습니다. 비밀번호를 재설정해주세요."})
						}else{
							return done(null, false, {message:"아이디 또는 비밀번호를 잘못 입력하셨습니다. 5회 잘못 입력시 정보가 초기화됩니다."})
						}
					})
			   	}
			} else {
				return done(null, false, {message:"아이디를 찾을 수 없습니다."})
			}
		})
	}
))

passport.serializeUser(function(user, done) {
	done(null, user.user_id);
});

passport.deserializeUser(function(user_id, done) {
	// done(null, user);
	done(null, {"user_id" : user_id});
})

module.exports = passport
