var pool = require(__dirname + "/../services/database").pool;

module.exports.getScannerData = function(callback) {
	pool.getConnection(function(err, conn) {
		if(err) {
			console.log(err);
			callback(false);
			return;
		}

		var query = "select tag_id, time, lat, lon from tbl_gps order by _id desc limit 20;"
		conn.query(query, function(err, result) {
			conn.release();
			if(err) {
				console.log(err);
				callback(false);
				return;
			}

			callback(result);
		});
	});
}

module.exports.getScannerDumpData = function(_id, callback) {
    pool.getConnection(function(err, conn) {
        if(err) {
            console.log(err);
            callback(false);
            return;
        }

        var current_id = _id - 1;

        var query = "select distinct tag_id, time, lat, lon from tbl_gps_dump where _id between ? and ? order by _id desc;"
        //var query = "select tag_id, time, lat, lon from tbl_gps_dump where _id <= ? order by _id desc limit 10;"
        conn.query(query, [current_id, _id], function(err, result) {
            conn.release();
            if(err) {
                console.log(err);
                callback(false);
                return;
            }

            callback(result);
        });
    });
}

module.exports.insertScannerData = function(tag_id, time, lat, lon, callback) {
	pool.getConnection(function(err, conn) {
		if(err) {
			console.log(err);
			callback(false);
			return;
		}

		var query = "insert into tbl_gps values(null, ?, ?, ?, ?)"

		conn.query(query, [tag_id, time, lat, lon], function(err, result) {
			conn.release();
			if(err) {
				console.log(err);
				callback(false);
				return;
			}
			callback(true);
		});
	});
}
