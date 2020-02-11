var pool = require(__dirname + "/../services/database").pool;

module.exports.insertLoginID = function(session_id, user_id, callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log(err);
            callback(false);
            return
        }

        var query = "INSERT INTO tbl_logged_id VALUES(null, ?, ?) ON DUPLICATE KEY UPDATE session_id = ?, user_id = ?"

        connection.query(query, [session_id, user_id, session_id, user_id], function(err, result){
            connection.release()

            if(err){
                console.log(err);
                callback(false);
                return;
            }
        
            callback(true)
        })
    })
}

module.exports.currentLoginID = function(callback) {
    pool.getConnection(function(err, connection){
        if(err){
            console.log(err);
            callback(false);
            return
        }

        var query = "SELECT * FROM tbl_logged_id"

        connection.query(query, [], function(err, result){
            connection.release()

            if(err){
                console.log(err);
                callback(false);
                return;
            }
        
            callback(result)
        })
    })
}