//  OracleDBComponent..js
var oracledb       = require('oracledb');
var DbConfig         = require('./dbConfig.js');

//Paramaets to be passed into this module
var inParams       = {};

function dbConnection (DbConfig, callback) {
    oracledb.getConnection(DbConfig, function (err, conn) {
            if (err) {
                console.trace('Error in dbConnection ' + err);
                return false;
            }
            console.log('Successfull Connection');
            callback(conn,getResult);
        }
    );
}

function dbExecute(conn,callback)
{
    inSqlStatement = "BEGIN  p_db_proc_gateway(:ReqNo,:crudOperation,:procName,:RequestMsg,:resultStatus,:ResponseMsg) ; END;";
                   //`begin get_clob3(:reqNo,:procName,:requestMsg,:resultStatus,:responseMsg); end;`;

    conn.execute( inSqlStatement
        , inParams
        ,function(err, result) {
            if (err) {
                console.trace('Error in dbExecute ' + err);
                return false;
            }
            resultStatus =  JSON.parse(JSON.stringify(result.outBinds.resultStatus));
            console.log('ResultMsg1'+resultStatus);
                callback(result.outBinds.responseMsg,conn)
                .then(function(result) {console.log('Final Result '+result)})
                .catch(function(result) {console.log('Catch Error '+result)});
        }
    );
}

function getResult(inClobStream , conn)
{ return new Promise(function (resolve,reject)
{
    clobContent = '';

    inClobStream.on('data', function(chunk) {
        clobContent += chunk;
    });

    inClobStream.on('end', function() {
        console.log('Got all the clob content! Final text is:', clobContent);
        resolve(clobContent);
    });

    inClobStream.on('close', function() { console.log('Getresult.close()');
        conn.close(function(err) {
            if (err) {
                reject(err);
            }
        });
    });

    inClobStream.on('error', function(err) { console.log('Getresult.error()');
        reject(err);
    });
});
}

function main(lReqNo,lCrudOperation,lProcName,lRequestMsg ) {
   inParams       =
         {reqNo:         lReqNo,crudOperation :  lCrudOperation
         ,procName:      lProcName
         ,requestMsg:    lRequestMsg
         ,resultStatus:  {dir: oracledb.BIND_OUT,type: oracledb.DB_CHAR}
         ,responseMsg:   {dir: oracledb.BIND_OUT,type: oracledb.CLOB}
    };
    console.log('Request no '+inParams.reqNo);
    dbConnection(DbConfig, dbExecute);
}

main('1999993','get','get_Clob','asdasdasdasdasdasd');
