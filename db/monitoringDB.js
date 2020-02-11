 var pool = require(__dirname + "/../services/database").pool;

module.exports.getAllLayer = function(callback) {
	pool.getConnection(function(err, connection) {

		if (err) {
			console.log(err);
			callback(false);
			return;
		}

		var query = "select * from tbl_map";
		connection.query(query, [], function(err, result) {
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
module.exports.getLocation = function(beacon_id, callback) {
	pool.getConnection(function(err, connection) {

		if (err) {
			console.log(err);
			callback(false);
			return;
		}

		var query = "SELECT location FROM tbl_beacon WHERE beacon_id = ?";
		connection.query(query, [beacon_id],
			function(err, result) {
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

module.exports.getMap = function(layer, callback) {
	pool.getConnection(function(err, connection) {

		if (err) {
			console.log(err);
			callback(false);
			return;
		}

		var query = "select path from tbl_map where layer = ?";
		connection.query(query, [layer],
			function(err, result) {
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

module.exports.getMonitoringInfo = function(layer, callback) {
	pool.getConnection(function(err, connection) {

		if (err) {
			console.log(err);
			callback(false);
			return;
		}

		var query = "SELECT tag_id, tag_name, type, location, deck, emergencyCode, T.layer FROM "
					+"(SELECT t1.tag_id, t1.tag_name, t1.type, t2.location, t1.emergencyCode, t2.layer FROM tbl_mtag t1 JOIN tbl_beacon t2 ON t1.beacon_id = t2.beacon_id) T JOIN tbl_map S ON T.layer = S.layer WHERE T.layer = ? ";

		connection.query(query, [layer],
			function(err, result) {
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

module.exports.getTagCount = function(layer, callback) {
	pool.getConnection(function(err, connection) {

		if (err) {
			console.log(err);
			callback(false);
			return;
		}

		var query = "SELECT TYPE, T.layer, IFNULL(SUM(Bo), 0) AS Boarder, IFNULL(SUM(Pa), 0) AS Passenger, IFNULL(SUM(Ca), 0) AS Cargo "
					+ "FROM"
					+ "( "
					+ 	 "SELECT TYPE, t2.layer, "
					+ 	 "CASE WHEN TYPE = 'Boarder' THEN 1 END AS Bo, "
					+ 	 "CASE WHEN TYPE = 'Passenger' THEN 1 END AS Pa, "
					+ 	 "CASE WHEN TYPE = 'Cargo' THEN 1 END AS Ca "
					+	 "FROM tbl_mtag t1 JOIN tbl_beacon t2 ON t1.beacon_id = t2.beacon_id "
					+    "WHERE t1.isActive = 1 AND t2.isInstalled = 1"
					+") "
					+"T JOIN tbl_map S ON T.layer = S.layer WHERE T.layer = ?";
					+"GROUP BY TYPE"
		connection.query(query, [layer], function(err, result) {
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

module.exports.getMtagPosition = function(layer, callback) {
	pool.getConnection(function(err, connection) {

		if (err) {
			console.log(err);
			callback(false);
			return;
		}

		var query = "SELECT t1.beacon_id, COUNT(*) as 'count', x, y, layer FROM tbl_mtag t1 JOIN tbl_beacon t2 ON t1.beacon_id = t2.beacon_id " 
		 			 + "WHERE t2.layer = ? AND t1.isActive = 1 AND t2.isInstalled = 1 GROUP BY t1.beacon_id ";
		connection.query(query, [layer],
			function(err, result) {
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

module.exports.getMtagInfo = function(beacon_id, callback) {
	pool.getConnection(function(err, connection) {

		if (err) {
			console.log(err);
			callback(false);
			return;
		}

		var query = "SELECT tag_id, tag_name, type, emergencyCode FROM tbl_mtag WHERE beacon_id = ? AND isActive = 1";
		connection.query(query, [beacon_id],
			function(err, result) {
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

module.exports.updateMtagPosition = function(tag_id, beacon_id, rssi, isEmergency, emergencyCode, callback) {
	pool.getConnection(function(err , connection) {
		if (err) {
			console.log(err);
			callback(false);
			return
		}

		var query = "update tbl_mtag set isActive = 1, beacon_id = ?, rssi = ?, isEmergency = ?, emergencyCode = ? where tag_id = ? ";
		connection.query(query, [beacon_id, rssi, isEmergency, emergencyCode, tag_id], function(err, result){
			connection.release();

			if (err) {
				console.log(err);
				callback(false);
				return;
			}

			callback(true);
		})
	})
}

module.exports.getInstalledBeacon = function(beacon_id, callback) {
	pool.getConnection(function(err, connection) {
		if(err) {
			console.log(err);
			callback(false);
			return
		}

		var query = "select beacon_id from tbl_beacon where beacon_id = ? AND isInstalled = 1";
		connection.query(query, [beacon_id], function(err, result) {
			connection.release();

			if(err) {
				console.log(err);
				callback(false);
				return
			}

			if(result.length > 0) {
				callback(true);
				return
			} else if(result.length == 0) {
				callback(false);
				return
			} else {
				callback(false);
				return
			}
		})
	})
}

module.exports.getTempInfo = function(callback) {
	pool.getConnection(function(err, connection) {

		if (err) {
			console.log(err);
			callback(false);
			return;
		}

		var query = "SELECT temperature, humidity from tbl_mtag";
		connection.query(query, [], function(err, result) {
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

module.exports.getAccessInfo = function(callback) {
	if (err) {
		console.log(err);
		callback(false);
		return;
	}
}

module.exports.getEmergencyCount = function(callback) {
    pool.getConnection(function(err, connection) {

        if(err) {
            console.log(err);
            callback(false);
            return;
        }

        var query = "SELECT tag_id FROM tbl_mtag WHERE isEmergency > 0";

        connection.query(query, [], function(err, result) {
            connection.release();

            if(err) {
                console.log(err);
                callback(false);
                return;
            }

            callback(result);
        });
    });
}

module.exports.getEmergencyInfo = function(callback) {
    pool.getConnection(function(err, connection) {

        if(err) {
            console.log(err);
            callback(false);
            return;
        }

        var query = "SELECT t1.tag_id, t1.tag_name, t1.type, t2.layer, t2.location "
                    + "FROM tbl_mtag t1 JOIN tbl_beacon t2 ON t1.beacon_id = t2.beacon_id "
                    + "WHERE t1.isEmergency > 0";

        connection.query(query, [], function(err, result) {
            connection.release();

            if(err) {
                console.log(err);
                callback(false);
                return;
            }

            callback(result);
        });
    });
}

module.exports.getEmergencyCode = function(tag_id, callback) {
    pool.getConnection(function(err, connection) {
        if(err) {
            console.log(err);
            callback(false);
            return;
        }

        var query = "SELECT isEmergency, emergencyCode FROM tbl_mtag WHERE tag_id = ?";
        connection.query(query, [tag_id], function(err, result) {
            connection.release();

            if(err) {
                console.log(err);
                callback(false);
                return;
            }

            callback(result);
        });
    });
}

module.exports.tagEmergencyRelease = function(tag_id, callback) {
	pool.getConnection(function(err , connection) {

		if (err) {
			console.log(err);
			callback(false);
			return
		}

		var query = "update tbl_mtag set isEmergency = 0, emergencyCode = 0 where tag_id = ? ";
		connection.query(query, [tag_id], function(err, result){
			connection.release();

			if (err) {
				console.log(err);
				callback(false);
				return;
			}

			callback(true);
		})
	})
}

module.exports.getEnabledTagsID = function(callback) {
	pool.getConnection(function(err, connection) {
		if(err) {
			console.log(err)
			callback(false)
			return
		}

		var query = "SELECT tag_id FROM tbl_mtag "
					+ "WHERE isActive = 1 AND beacon_id IN (SELECT beacon_id FROM tbl_beacon)"
		connection.query(query, [], function(err, result) {
			connection.release()

			if(err) {
				console.log(err)
				callback(false)
				return
			}

			callback(result)
		})
	})
}
