var express = require("express");
var nunjucks = require("nunjucks");
var passport = require(__dirname + "/services/passport");
var session = require("express-session");
var flash = require('connect-flash');
var app = express();
var fs = require("fs")
var config = require(__dirname + "/config")

var views = __dirname + "/views"
var store_path = __dirname + "/sessions"

var db = require(__dirname + "/db/backupDB.js");
var csv = require('fast-csv');
var moment = require('moment'); 
require('moment-timezone');
moment.tz.setDefault('Asia/Seoul');

if(config.type == "http") {
	var http = require("http").Server(app);
} else if(config.type == "https") {
	var options = {
		key: fs.readFileSync(__dirname + '/certfile/server/server.key'),
		cert: fs.readFileSync(__dirname + '/certfile/server/server.crt')
	}
	var http = require("http").Server(app);
	var https = require("https").createServer(options, app);
}

app.use(session({
    secret: '@#@$MYSIGN#@$#$',
    resave: false,
	saveUninitialized: true,
	cookie: {secure: true, maxAge: null, signed: true},
}))

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use("/static", express.static(__dirname + "/public"));
app.use("/js", express.static(__dirname + "/node_modules/jquery/dist"));
app.use("/js", express.static(__dirname + "/node_modules/jquery-ui-dist"));
app.use("/css", express.static(__dirname + "/node_modules/jquery-ui-dist"));
app.use("/cert", express.static(__dirname + "/certfile"));

nunjucks.configure(views, {
	autoescape : true,
	express    : app,
	watch      : true
});

var mainRoute = require(__dirname + "/route/mainRoute");
var systemRoute = require(__dirname + "/route/systemRoute");
var mtagRoute = require(__dirname + "/route/mtagRoute");
var monitoringRoute = require(__dirname + "/route/monitoringRoute");
var scanRoute = require(__dirname + "/route/scanRoute");
var loginRoute = require(__dirname + "/route/loginRoute");
var helpRoute = require(__dirname + "/route/helpRoute");

app.use("/login", loginRoute);
app.use("/main", mainRoute);
app.use("/system", systemRoute);
app.use("/mtag", mtagRoute);
app.use("/monitoring", monitoringRoute);
app.use("/help", helpRoute);

app.use("/scanner", scanRoute);

app.get('/', function(req, res){
	res.redirect("/main");
});

setInterval(backupMtagData, 60000);
setInterval(backupBeaconData, 60000);

function backupMtagData(){
	var date = moment().format('YYYYMMDDHHmmss');
	var ws = fs.createWriteStream(__dirname + '/backup_data/mtag/' + date + '.csv');
	var all_array = [];
	var array_mtag = [];
	db.getMtag(function(result){
		for(var i=0; i<result.length; i++){
			array_mtag.push(result[i].tag_id);
			array_mtag.push(result[i].tag_name);
			all_array.push(array_mtag);
			array_mtag = [];
		}
		csv.write(all_array, {headers:true})
		.pipe(ws);
	})
}
function backupBeaconData(){
	var date = moment().format('YYYYMMDDHHmmss');
	var ws = fs.createWriteStream(__dirname + '/backup_data/beacon/' + date + '.csv', {encoding : 'binary'});
	var all_array = [];
	var array_mtag = [];
	db.getBeacon(function(result){
		for(var i=0; i<result.length; i++){
			array_mtag.push(result[i].beacon_id);
			array_mtag.push(result[i].x);
			array_mtag.push(result[i].y);
			array_mtag.push(result[i].layer);
			array_mtag.push(result[i].location);
			array_mtag.push(result[i].isInstalled);
			all_array.push(array_mtag);
			array_mtag = [];
		}
		csv.write(all_array, {headers:true})
		.pipe(ws);
	})
}

if(config.type == "http") {
	http.listen(config.port, function() {
		console.log("server start 9008");
	});
} else if(config.type == "https") {
	https.listen(config.port,"0.0.0.0", function(){
		console.log("https server start")
	})
}
