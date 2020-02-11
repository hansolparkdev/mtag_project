var config = {
	"port": "9008",
	"database" : {
		"url"      : "127.0.0.1",
		"user"     : "root",
		"password" : "s3tdev",
		"name"     : "soosang_mtag"
	},
	"mqtt" : {
		"url" : "127.0.0.1",
		"port": 1883
	},
	// "type":"http"
	"type": "https"
};

module.exports = config;