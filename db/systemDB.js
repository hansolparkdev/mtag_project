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

module.exports.getBeaconInfo = function(layer, callback) {
	pool.getConnection(function(err, connection) {
		
		if (err) {
			console.log(err);
			callback(false);
			return;
		}

		var query = "SELECT beacon_id, deck, categoray, x, y, location, isInstalled FROM tbl_beacon t1 JOIN tbl_map t2 ON t1.layer = t2.layer WHERE t1.layer = ?";
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

module.exports.getMtagInfo = function(callback) {
	pool.getConnection(function(err, connection) {
		
		if (err) {
			console.log(err);
			callback(false);
			return;
		}

		var query = "SELECT tag_id, type, isActive, location, isEmergency FROM tbl_mtag t1 JOIN tbl_beacon t2 ON t1.beacon_id = t2.beacon_id";
		connection.query(query, [],
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

module.exports.updateBeacon = function(beacon_id, x, y, callback) {
	pool.getConnection(function(err, connection) {
		
		if (err) {
			console.log(err);
			callback(false);
			return;
		}

		var query = "UPDATE tbl_beacon SET x = ?, y = ? WHERE beacon_id = ? ";
		connection.query(query, [x, y, beacon_id],
			function(err, result) {
				connection.release();

				if (err) {
					console.log(err);
					callback(false);
					return;
				}
				callback(true);
			});
	});
}
module.exports.addBeacon = function(beacon_id, layer, callback) {
	pool.getConnection(function(err, connection) {
	
		if (err) {
			console.log(err);
			callback(false);
			return;
		}

		var query = "insert into tbl_beacon (beacon_id, layer) values (?, ?)";
		connection.query(query, [beacon_id, layer],
			function(err, result) {
				connection.release();

				if (err) {
					console.log(err);
					callback(err.code);
					return;
				}
				callback(true);
			});
	});
}
module.exports.ModifyBeaconInfo = function(beacon_id, callback) {
	pool.getConnection(function(err, connection) {
		
		if (err) {
			console.log(err);
			callback(false);
			return;
		}

		var query = "select * from tbl_beacon where beacon_id = ?";
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

module.exports.ModifyBeacon = function(beacon_id, location, isInstalled, callback) {
	pool.getConnection(function(err, connection) {
		
		if (err) {
			console.log(err);
			callback(false);
			return;
		}

		var query = "UPDATE tbl_beacon SET location=?, isInstalled=? WHERE beacon_id = ? ";
		connection.query(query, [location, isInstalled, beacon_id],
			function(err, result) {
				connection.release();

				if (err) {
					console.log(err);
					callback(false);
					return;
				}
				callback(true);
			});
	});
}

module.exports.deleteBeaconInfo = function(beacon_id, callback) {
	pool.getConnection(function(err, connection) {
		
		if (err) {
			console.log(err);
			callback(false);
			return;
		}

		var query = "DELETE FROM tbl_beacon WHERE beacon_id = ?";
		connection.query(query, [beacon_id],
			function(err, result) {
				connection.release();

				if (err) {
					console.log(err);
					callback(false);
					return;
				}
				callback(true);
			});
	});
}

module.exports.checkInstalled = function(beacon_id, callback) {
	pool.getConnection(function(err, connection) {
		
		if (err) {
			console.log(err);
			callback(false);
			return;
		}

		var query = "update tbl_beacon set isInstalled = 1 where beacon_id = ?";
		connection.query(query, [beacon_id],
			function(err, result) {
				connection.release();

				if (err) {
					console.log(err);
					callback(false);
					return;
				}
				callback(true);
			});
	});
}

module.exports.noCheckInstalled = function(beacon_id, callback) {
	pool.getConnection(function(err, connection) {
		
		if (err) {
			console.log(err);
			callback(false);
			return;
		}

		var query = "update tbl_beacon set isInstalled = 0 where beacon_id = ?";
		connection.query(query, [beacon_id],
			function(err, result) {
				connection.release();

				if (err) {
					console.log(err);
					callback(false);
					return;
				}
				callback(true);
			});
	});
}

module.exports.checkRegistered = function(beacon_id, callback) {
	pool.getConnection(function(err, connection) {
		
		if (err) {
			console.log(err);
			callback(false);
			return;
		}

		var query = "update tbl_beacon set isRegister = 1 where beacon_id = ?";
		connection.query(query, [beacon_id],
			function(err, result) {
				connection.release();

				if (err) {
					console.log(err);
					callback(false);
					return;
				}
				callback(true);
			});
	});
}

module.exports.noCheckRegistered = function(beacon_id, callback) {
	pool.getConnection(function(err, connection) {
		
		if (err) {
			console.log(err);
			callback(false);
			return;
		}

		var query = "update tbl_beacon set isRegister = 0 where beacon_id = ?";
		connection.query(query, [beacon_id],
			function(err, result) {
				connection.release();

				if (err) {
					console.log(err);
					callback(false);
					return;
				}
				callback(true);
			});
	});
}