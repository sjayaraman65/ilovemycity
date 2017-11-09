//  OracleDBComponent..js
var oracledb       = require('oracledb');
var config         = require('./dbConfig.js');
// variables   get_clob3 to be replaced with Pl/sql gateway
var inSqlStatement = //`begin get_clob3(:reqNo,:procName,:requestMsg,:resultStatus,:responseMsg); end;`;
                    "BEGIN  p_db_proc_gateway(:ReqNo,:procName,:RequestMsg,:resultStatus,:ResponseMsg) ; END;"

//Paramaets to be passed into this module
var inParams       = {};

function dbConnection (config, callback) {
    oracledb.getConnection(config, function (err, conn) {
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
        conn.execute( inSqlStatement
        , inParams
        ,function(err, result) {
            if (err) {
                console.trace('Error in dbExecute ' + err);
                return false;
            }
            //callback(result.outBinds.clob,conn).then(console.log('Final Result '||clobContent))

            var resultStatus =  JSON.parse(JSON.stringify(result.outBinds.resultStatus));

            console.log('ResultMsg1'+resultStatus);

            var clobStream =  result.outBinds.resp;
            getResult(clobStream,conn)
                .then(function(result) {console.log('Final Result '+result)})
                .catch(function(result) {console.log('Catch Error '+result)});
        }
    );
}

function getResult(inClobStream , conn)
{ return new Promise(function (resolve,reject)
{

    var clobContent = '';

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

function main(lReqNo,lProcName,lRequestMsg ) {
   inParams       =
         {reqNo:         lReqNo
         ,procName:      lProcName
         ,requestMsg:    lRequestMsg
         ,resultStatus:  {dir: oracledb.BIND_OUT,type: oracledb.DB_CHAR}
         ,responseMsg:   {dir: oracledb.BIND_OUT,type: oracledb.CLOB}
    };
    console.log('Request no '+inParams.reqNo);
    dbConnection(config, dbExecute);
}

main('1212123','plsqlgateway','asdasdasdasdasdasd');
