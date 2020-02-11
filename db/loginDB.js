var pool = require(__dirname + "/../services/database").pool;
var crypto = require("crypto")

module.exports.checkChangePassword = function(callback){
    pool.getConnection(function(err, connection){
      if(err){
          console.log(err);
          callback(false);
          return
      }
        var query = "SELECT status FROM tbl_user where user_id = 'admin'";
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

module.exports.checkTemporaryCode = function(temporary_code, callback){
  var key = "z$C&F)H@McQfTjWn6v9y$B&E)H+MbQeTp2s5v8y/B?E(H+KbUjXn2r5u8x/A?D(GcQfTjWnZr4u7x!A%";
  var cipher = crypto.createCipher('aes256', key);
  var cipher_result = cipher.update(temporary_code, 'utf8', 'base64'); // 'HbMtmFdroLU0arLpMflQ'
  cipher_result += cipher.final('base64');
  pool.getConnection(function(err, connection){
    if(err){
      console.log(err);
      callback(false);
      return;
    }
    var query = "select * from tbl_user where user_id = 'admin' and temporary_code=?";
    connection.query(query, [cipher_result], 
      function(err, result){
        connection.release()

        if(err){
          console.log(err);
          callback(false);
          return;
        }
        
        if(result == ""){
          callback(false);
        }else{
          callback(true);
        }
      })
  })
}

// ChangePwd
module.exports.ChangePwd = function(npwd, cpwd, callback){
  var key = "z$C&F)H@McQfTjWn6v9y$B&E)H+MbQeTp2s5v8y/B?E(H+KbUjXn2r5u8x/A?D(GcQfTjWnZr4u7x!A%";
	var cipher = crypto.createCipher('aes256', key);
	var cipher_result = cipher.update(npwd, 'utf8', 'base64'); // 'HbMtmFdroLU0arLpMflQ'
	cipher_result += cipher.final('base64');

    pool.getConnection(function(err, connection){
      if(err){
          console.log(err);
          callback(false);
          return
      }
      var query = "update tbl_user set password = ?, status = 0, pwd_err_count = 0 where user_id='admin'";
      connection.query(query, [cipher_result],
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

module.exports.initPassword = function(pwd, callback){
  pool.getConnection(function(err, connection){
  if(err){
      console.log(err);
      callback(false);
      return
  }

  var query = "update tbl_user set password = ?, status = 1 where user_id='admin'";
  connection.query(query, [pwd],
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
  
module.exports.initErrPwd = function(callback){
  pool.getConnection(function(err, connection){
    if(err){
        console.log(err);
        callback(false);
        return
    }

    var query = "update tbl_user set pwd_err_count = 0 where user_id='admin'";
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
  
module.exports.countUpPwdError = function(callback){
  pool.getConnection(function(err, connection){
    if(err){
        console.log(err);
        callback(false);
        return
    }

    var query = "update tbl_user set pwd_err_count = pwd_err_count+1 where user_id='admin'";
    var query2 = "select pwd_err_count from tbl_user where user_id='admin'";
    connection.query(query+";"+query2, [],
      function(err, result){
        connection.release()

        if(err){
          console.log(err);
          callback(false);
          return;
        }
        callback(result[1])
      })
  })
}

module.exports.information = function(userId, callback){
    pool.getConnection(function(err, connection){
        if(err){
            console.log(err);
            callback(false);
            return
        }

        var query = "SELECT user_id, password, status FROM tbl_user where user_id= ?";
        connection.query(query,[userId],
            function(err, result){
                connection.release()

                if(err){
                    console.log(err);
                    callback(false);
                    return;
                }

                var rows = result.length;

                if(rows>0){
                    callback(true, result[0]["password"], result[0]["status"]);
                } else {
                    callback(false, null)
                }
            })
    })
}