var pool = require(__dirname + "/../services/database").pool;

module.exports.getOnBoardInfo = function(callback){
	pool.getConnection(function(err, connection){
		
		if (err) {
			console.log(err);
			callback(false);
			return;
		}

		var query = "SELECT S.deck, IFNULL(SUM(Bo), 0) AS Boarder, IFNULL(SUM(Pa), 0) AS Passenger, IFNULL(SUM(Ca), 0) AS Cargo "
					+"FROM "
					+"( "
					+"SELECT " 
					+"t2.layer, "
					+"CASE WHEN TYPE = 'Boarder' THEN 1 END AS Bo, "
					+"CASE WHEN TYPE = 'Passenger' THEN 1 END AS Pa, "
					+"CASE WHEN TYPE = 'Cargo' THEN 1 END AS Ca "
					+"FROM tbl_mtag AS t1 "
					+"JOIN tbl_beacon AS t2 "
					+"ON t1.beacon_id = t2.beacon_id WHERE t1.isActive = 1 AND t2.isInstalled = 1"
					+") AS T "
					+"JOIN tbl_map S ON T.layer = S.layer "
					+"GROUP BY T.layer ORDER BY T.layer DESC ";
		connection.query(query, [], function(err, result){
			connection.release();

			if (err) {
				console.log(err);
				callback(false);
				return;
			}
			callback(result);
		});
	});
}

module.exports.getTagInfo = function(callback){
	pool.getConnection(function(err, connection){
		
		if (err) {
			console.log(err);
			callback(false);
			return;
		}

		var query = "SELECT TYPE, IFNULL(SUM(Ac), 0) AS Active, IFNULL(SUM(Em), 0) AS Emergency "
					+"FROM "
					+"( "
					+	"SELECT " 
					+	"TYPE, "
					+	"CASE WHEN isActive = 1 THEN 1 END AS Ac, "
					+	"CASE WHEN isEmergency = 1 THEN 1 END AS Em "
					+	"FROM tbl_mtag "
					+") " 
					+"AS T "
					+"GROUP BY TYPE ";
		connection.query(query, [], function(err, result){
			connection.release();

			if (err) {
				console.log(err);
				callback(false);
				return;
			}
			callback(result);
		});
	});
}

module.exports.getBeaconInfo = function(callback){
	pool.getConnection(function(err, connection){
		
		if (err) {
			console.log(err);
			callback(false);
			return;
		}
		
		var query = "SELECT S.deck, IFNULL(SUM(Re), 0) AS Register, IFNULL(SUM(ins), 0) AS Installed "
					+"FROM "
					+"( "
					+	"SELECT "
					+	"layer, "
					+	"CASE WHEN isRegister = 1 THEN 1 END AS Re, "
					+	"CASE WHEN isInstalled = 1 THEN 1 END AS ins "
					+	"FROM tbl_beacon "
					+") "
					+"AS T JOIN tbl_map S ON T.layer = S.layer "
					+"GROUP BY T.layer ORDER BY T.layer DESC ";
		connection.query(query, [], function(err, result){
			connection.release();

			if (err) {
				console.log(err);
				callback(false);
				return;
			}
			callback(result);
		});
	});
}