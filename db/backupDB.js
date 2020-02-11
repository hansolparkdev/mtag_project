var pool = require("../services/database").pool;

module.exports.getMtag = function(callback){
    pool.getConnection(function(err, connection){
      if(err){
          console.log(err);
          callback(false);
          return
      }
        var query = "SELECT * FROM tbl_mtag";
        connection.query(query, [],
          function(err, result){
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

module.exports.getBeacon = function(callback){
    pool.getConnection(function(err, connection){
      if(err){
          console.log(err);
          callback(false);
          return
      }
        var query = "SELECT * FROM tbl_beacon";
        connection.query(query, [],
          function(err, result){
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