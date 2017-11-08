// app.js  

var oracledb = require('oracledb');

var dbConfig = require('./dbconfig.js');

exports.getDsr = function execSql() {
    oracledb.getConnection({
        user: dbConfig.user,
        password: dbConfig.password,
        connectString: dbConfig.connectString
    }, function (err, connection) {
        if (err) {
            console.error(err.message);
            return;
        }
        connection.execute("select etl_process, etl_subprocess, user_notification_ind, last_updated_date, last_updated_userid from DSX_ETL_CONTROL",
            [],
            function (err, result) {
                if (err) {
                    console.error(err.message);
                    doRelease(connection);
                    return;
                }
                console.log(result.metaData);
                console.log(result.rows);
                doRelease(connection);
            });
    });
}

function doRelease(connection) {  
     connection.release(  
          function(err) {  
               if (err) {console.error(err.message);}  
          }  
     );  
}




