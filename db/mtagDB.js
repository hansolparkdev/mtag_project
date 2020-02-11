var pool = require(__dirname + "/../services/database").pool;

module.exports.getMtagInfo = function(callback) {
	pool.getConnection(function(err, connection) {
		if (err) {
			console.log(err);
			callback(false);
			return;
		}

		var query = "SELECT tag_id, tag_name, type, isActive, emergencyCode FROM tbl_mtag ";
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

module.exports.tagAdd = function(tag_id, tag_name, type, callback) {
	pool.getConnection(function(err, connection){
		
		if (err) {
			console.log(err);
			callback(false);
			return;
		}

		var query = "INSERT INTO tbl_mtag (tag_id, tag_name, type) VALUES (?, ?, ?)";
		connection.query(query, [tag_id, tag_name, type],
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

module.exports.ModifyTagInfo = function(tag_id, callback) {
	pool.getConnection(function(err, connection) {
		if (err) {
			console.log(err);
			callback(false);
			return;
		}

		var query = "select * from tbl_mtag where tag_id = ?";
		connection.query(query, [tag_id],
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

module.exports.ModifyTag = function(tag_id, tag_name, type, callback) {
	pool.getConnection(function(err, connection) {
		if (err) {
			console.log(err);
			callback(false);
			return;
		}

		var query = "UPDATE tbl_mtag SET type = ?, tag_name = ? WHERE tag_id = ? ";
		connection.query(query, [type, tag_name, tag_id], function(err, result) {
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

module.exports.deleteTag = function(tag_id, callback) {
	pool.getConnection(function(err, connection) {
		if (err) {
			console.log(err);
			callback(false);
			return;
		}

		var query = "DELETE FROM tbl_mtag WHERE tag_id = ?";
		connection.query(query, [tag_id],
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

module.exports.getTagStatus = function(tag_id, callback) {
	pool.getConnection(function(err, connection) {
		if(err) {
			console.log(err);
			callback(false);
			return;
		}

		var query = "SELECT t1.tag_id, t1.tag_name, t2.location, t1.isActive, t1.update_time " 
					+ "FROM tbl_mtag t1 JOIN tbl_beacon t2 ON t1.beacon_id = t2.beacon_id " 
					+ "WHERE t1.tag_id = ?"
		connection.query(query, [tag_id], function(err, result) {
			connection.release();

			if (err) {
				console.log(err);
				callback(err.code);
				return;
			}
			callback(result);				
		});
	});
}