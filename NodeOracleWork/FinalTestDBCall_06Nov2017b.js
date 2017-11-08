var oracledb       = require('oracledb');
var config         = require('./dbConfig.js');
// variables
//var inSqlStatement = `begin get_clob(:reqno,:clob); end;`;
var inSqlStatement = `begin get_clob2(:reqNo,:resultStatus,:responseMsg); end;`;

var inParams       = {reqNo: 19999990
                     ,resultStatus:     {dir: oracledb.BIND_OUT,type: oracledb.DB_CHAR}
                     ,responseMsg:   {dir: oracledb.BIND_OUT,type: oracledb.CLOB}
                    };

function dbConnection (config, callback) {
    oracledb.getConnection(config, function (err, conn) {
            if (err) {
                console.trace('Error in dbConnection ' + err);
                return false;
            }
            console.log('Successfull Connection');
            callback(conn,processResult);
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


            console.log('ResultMsg1'resultStatus.result));

            //processResult(clobStream,conn).then(function(result) {console.log('Final Result '+result)});
        }
    );
}

function processResult(inClobStream , conn)
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

    inClobStream.on('close', function() {
        conn.close(function(err) {
            if (err) {
                reject(err);
            }
        });
    });

    inClobStream.on('error', function(err) {
        reject(err);
    });
});
}

function main() {
    dbConnection(config, dbExecute);
}

main();
