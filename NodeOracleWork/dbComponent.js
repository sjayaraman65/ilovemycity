// DB Component Node.js -- calls the pl/sql Db Component

var oracledb = require('oracledb');
var dbConfig = require('./dbconfig.js')

function handleDatabaseOperation( request, response, callback) {

    oracledb.getConnection(
        {
            user          : dbConfig.user,
            password      : dbConfig.password,
            connectString : dbConfig.connectString
        },
        function(err, connection)
        {
            if (err) {
                console.log('Error in acquiring connection ...');
                console.log('Error message '+err.message);
                return;
            }
            callback(request, response, connection);
        });
}//handleDatabaseOperation

function doRelease(connection)
{
    connection.release(
        function(err) {
            if (err) {
                console.error('doRelease :'+err.message);
            }
        });
}// doRelease

function dbComponent(request, response ) {
    handleDatabaseOperation( request, response, function (request, response, connection) {
        var options = {
            inReqNo  :   1, // {type: oracledb.NUMBER_TYPE, dir: oracledb.BIND_IN},
            inRequestMsg  :   {type: oracledb.CLOB, dir: oracledb.BIND_IN},
            outResponseMsg :   {type: oracledb.CLOB, dir: oracledb.BIND_INOUT},
            outResult :   {type: oracledb.CLOB, dir: oracledb.BIND_INOUT}
        };
        var executeStatement =  "BEGIN  p_db_proc_gateway(:inReqNo,:inRequestMsg,:outResponseMsg,:outResult) ; END;";
        var resultMsg        =  {"result":"SUCCESS","msg":""};

        connection.execute( executeStatement
            , options
            , function (err, result) {
                if (err) {
                    console.log('Error in execution of execute statement'+err.message);
                    resultMsg   = {"result":"FAILURE","msg":JSON.stringify(err.message) };
                } else {
                    console.log('I am here 3 in db_component')
                    //console.log(result.outBinds);
                    var lob = result.outBinds.outResponseMsg;
                    if (lob.type === oracledb.CLOB) {
                        console.log('I am here 4 in db_component')
                        lob.setEncoding('utf8');  // set the encoding so we get a 'string' not a 'buffer'
                        console.log('db response is ready -- '||lob.toString());
                    }
                    lob.on('error', function(err) { cb(err); });
                    lob.on('close', function() { cb(null); });   // all done.  The Lob is automatically closed.

                    fs = require('fs')
                    var outStream = fs.createWriteStream('myoutput.txt');
                    outStream.on('error', function(err) { cb(err); });

                    lob.pipe(outStream);
                }
                console.log(resultMsg);
                doRelease(connection);
            }
        );

    });
} // dbComponent
function processResult(result, connection) {
    var clobStream = result.outBinds.outResponseMsg;
    var clobContent = '';

    clobStream.on('data', function(chunk) {
        clobContent += chunk;
    });

    clobStream.on('end', function() {
        console.log('Got all the clob content! Final text is:', clobContent);
    });

    clobStream.on('finish', function() {
        console.log('Finally Got all the clob content! Final text is:', clobContent);
    });

    clobStream.on('close', function() {
        connection.close(function(err) {
            if (err) {
                throw err;
            }
        });
    });

    clobStream.on('error', function(err) {
        console.log(err);
        throw err;
    });
}

function cb(err) {console.log(err)}

dbComponent();