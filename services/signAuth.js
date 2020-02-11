module.exports = function(req, res, next) {
	// console.log(req.isAuthenticated())
	if(req.isAuthenticated() == false) {
		return next();
	}
	
	res.redirect('/main')
}