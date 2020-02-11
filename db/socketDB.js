var pool = require(__dirname + "/../services/database").pool;

module.exports.tagUpdate1 = function(beacon_id, tag_id, callback) {
	pool.getConnection(function(err, connection) {

		if (err) {
			console.log(err);
			callback(false);
			return;
		}

		var query = "UPDATE tbl_mtag SET isActive = 1, beacon_id = ?, emergencyCode = 1, isEmergency= 1 WHERE tag_id = ?"
		// var query1 = "SELECT t1.layer, t1.location , t2.type, t2.tag_name FROM tbl_beacon t1 JOIN tbl_mtag t2 ON t1.beacon_id = t2.beacon_id WHERE t1.beacon_id = ? AND t2.tag_id = ? "
		connection.query(query, [beacon_id, tag_id], function(err, result) {
			connection.release();

			if (err) {
				console.log(err);
				callback(false);
				return;
			}
			
			callback(result)
			
		});
	});
}

module.exports.tagUpdate2 = function(beacon_id, tag_id, callback) {
	pool.getConnection(function(err, connection) {

		if (err) {
			console.log(err);
			callback(false);
			return;
		}

		var query = "UPDATE tbl_mtag SET isActive = 1, beacon_id = ? WHERE tag_id = ? "
		// var query1 = "SELECT t1.layer, t1.location , t2.type, t2.tag_name FROM tbl_beacon t1 JOIN tbl_mtag t2 ON t1.beacon_id = t2.beacon_id WHERE t1.beacon_id = ? AND t2.tag_id = ? "
		connection.query(query, [beacon_id, tag_id], function(err, result) {
			connection.release();

			if (err) {
				console.log(err);
				callback(false);
				return;
			}
			
			callback(result)
			
		});
	});
}

module.exports.tagUpdate3 = function(tag_id, beacon_id, rssi, emergencyCode, callback) {
	pool.getConnection(function(err, connection) {

		if (err) {
			console.log(err);
			callback(false);
			return;
		}

		var query = "UPDATE tbl_mtag SET beacon_id = ?, rssi = ?, emergencyCode = ? WHERE tag_id = ? "
		connection.query(query+";"+query1, [beacon_id, tag_id,beacon_id, tag_id], function(err, result) {
			connection.release();

			if (err) {
				console.log(err);
				callback(false);
				return;
			}
			
			callback([result[0], result[1]])
			
		});
	});
}


module.exports.layerInfo = function(beacon_id, tag_id, callback) {
	pool.getConnection(function(err, connection) {

		if (err) {
			console.log(err);
			callback(false);
			return;
		}

		var query = "SELECT t1.layer, t2.type, t2.tag_name FROM tbl_beacon t1 JOIN tbl_mtag t2 ON t1.beacon_id = t2.beacon_id WHERE t1.beacon_id = ? AND t2.tag_id = ? ";
		connection.query(query, [beacon_id, tag_id], function(err, result) {
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
