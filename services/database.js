var mysql = require("mysql")
var config = require(__dirname + "/../config");

var pool = mysql.createPool({
	connectionLimit:10,
	host:config.database.url,
	user:config.database.user,
	password:config.database.password,
	database:config.database.name,
	multipleStatements : true
});
module.exports.pool = pool;