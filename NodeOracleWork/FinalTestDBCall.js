var oracledb = require('oracledb');
var config = require('./dbConfig.js');


function dbConnection (config, callback) {
    oracledb.getConnection(config, function (err, conn) {
            if (err) {
                console.trace('Error in dbConnection ' + err);
                return false;
            }
            console.log('Successfull');
            callback(conn,processResult);
        }
    );
}

function dbExecute(conn,callback)
{
    conn.execute(
        `begin
      get_clob(:reqno,:clob);
    end;`,
        {   reqno: 199992,
            clob: {
                dir: oracledb.BIND_OUT,
                type: oracledb.CLOB
            }
        },
        function(err, result) {
            if (err) {
                console.trace('Error in dbExecute ' + err);
                return false;
            }
            callback(result,conn);
            //processResult(result, conn);
        }
    );
}

function processResult(result, conn)
{
    var clobStream = result.outBinds.clob;
    var clobContent = '';

    clobStream.on('data', function(chunk) {
        clobContent += chunk;
    });

    clobStream.on('end', function() {
        console.log('Got all the clob content! Final text is:', clobContent);
    });

    clobStream.on('close', function() {
        conn.close(function(err) {
            if (err) {
                throw err;
            }
        });
    });

    clobStream.on('error', function(err) {
        throw err;
    });
}

function main() {
    dbConnection(config, dbExecute);
}

main();
