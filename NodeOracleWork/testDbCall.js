var oracledb = require('oracledb');
var config = require('./dbConfig.js');

/*
function DbConnection(result, config)
{   return new Promise(function (resolve,reject)
    {   oracledb.getConnection(config,
                               function(err, conn)
                               {
                                  if (err) {
                                      console.log('9');
                                      reject(err);
                                  }
                                  else {                                      console.log('8');
                                      resolve(conn);
                                  }
                               }
                               );
    }
    );
}

function DbExecute(result, conn)
{   return new Promise(function (resolve, reject)
    {   conn.execute(`begin get_clob(:inReqNo,:clob); end;`,
                    {
                         inReqNo: '122312',
                         clob: {dir: oracledb.BIND_OUT, type: oracledb.CLOB}
                    }
                    ,function (err, result) {
                        if (err) {
                           reject(err);
                        }
                        else { resolve(result);
                        }
                    }
                    );
    }
    );
}

function ProcessResult(result, connection)
{ return new Promise(function (resolve,reject)
   {   var clobStream = result.outBinds.clob;
       clobContent = '';

       clobStream.on('data', function (chunk) {
           console.log('Got data :', clobContent);
           clobContent += chunk;
       });

       clobStream.on('end', function () {
           console.log('Got all the clob content! Final text is:', clobContent);
           connection.release();
           resolve(clobContent);
       });

       clobStream.on('close', function () {
           connection.close(function (err) {
           if (err) {
               reject( err);
           }
           });
       });

       clobStream.on('error', function (err) {
           console.trace('Erorr in process result '+err);
           reject( err);
       });
    });
}

*/
function processResult(result, conn)
{ return new Promise(function (resolve,reject)
 {
    var clobStream = result.outBinds.clob;
    var clobContent = '';

    clobStream.on('data', function(chunk) {
        clobContent += chunk;
    });

    clobStream.on('end', function() {
        console.log('Got all the clob content! Final text is:', clobContent);
        resolve(clobContent);
    });

    clobStream.on('close', function() {
        conn.close(function(err) {
            if (err) {
                reject(err);
            }
        });
    });

    clobStream.on('error', function(err) {
        reject( err);
    });
 });
}
/*
function cb(err) {console.log(err)};

DbConnection(config).then( console.log('1'));
    DbExecute(conn).then(
        ProcessResult(result, conn).then(
            function (result) {console.log('ss'+result)}
        );
    );
);
*/

function handleDatabaseOperation(  callback) {

    oracledb.getConnection( config
        ,function(err, connection)
        {
            if (err) {
                console.log('Error in acquiring connection ...');
                console.log('Error message '+err.message);
                return;
            }
            console.log('Connection successfull')
            callback( connection);
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

function dbComponent() {
    handleDatabaseOperation( function ( connection) {

        var options = { inReqNo  :   122312,clob  :  {type: oracledb.CLOB, dir: oracledb.BIND_OUT}};
        var executeStatement =  `begin get_clob(:inReqNo,:clob); end;`;
        var resultMsg        =  {"result":"SUCCESS","msg":""};

        connection.execute( executeStatement
            , options
            , function (err, result) {
                if (err) {
                    console.log('Error in execution of execute statement'+err.message);
                    resultMsg   = {"result":"FAILURE","msg":JSON.stringify(err.message) };
                } else {
                    console.log('I am here 3 in db_component '+JSON.stringify(result))

                    // ProcessResult(result).then(console.log('Succesfull '+result));
                    processResult(result, connection).then(
                        function (result) {console.log('ss'+result)}
                    );
                }
                console.log(resultMsg);
                doRelease(connection);
            }
        );

    });
} // dbComponent


dbComponent();