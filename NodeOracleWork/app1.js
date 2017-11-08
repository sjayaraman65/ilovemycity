var http = require('http'), fs= require('fs');
var path    = require("path");

var oracledb = require('oracledb');
var dbConfig = require('./dbconfig.js')

var express = require('express');
var app = express();

var PORT = process.env.PORT || 8089;

app.listen(PORT, function () {
    console.log('Server running, Express is listening...');
});

app.get('/', function (req, res) {
    console.log('I am here');
    //res.writeHead(200, { 'content-type': 'text/html' });
    res.sendFile(path.join(__dirname+'/public/mainmenu.html'));
});

// app.listen(PORT);
// Database Connection Module
function handleDatabaseOperation( request, response, callback) {
    console.log('1');
    console.log(request.method + ":" + request.url );
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    response.setHeader('Access-Control-Allow-Credentials', true);
    console.log('2');

    console.log('Handle request: '+request.url);
    //var connectString = process.env.DBAAS_DEFAULT_CONNECT_DESCRIPTOR.replace("PDB1", "demos");
    //console.log('ConnectString :' + connectString);
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

// Error connecting to DB
                response.writeHead(500, {'Content-Type': 'application/json'});
                response.end(JSON.stringify({
                        status: 500,
                        message: "Error connecting to DB",
                        detailed_message: err.message
                    }
                ));
                return;
            }
// do with the connection whatever was supposed to be done
            console.log('Connection acquired ; go execute ');
            callback(request, response, connection);
        });
}//handleDatabaseOperation

function doRelease(connection)
{
    connection.release(
        function(err) {
            if (err) {
                console.error(err.message);
            }
        });
}

// Modules for BlueCross Parameters and DB Calls
app.get('/bluecrossParams', function(req,res){ blueCrossParams(req, res);} );

app.get('/bluecrossDb', function(req,res){ blueCrossDb(req, res);} );

function blueCrossParams(request, response) {
    console.log(" I am in blueCross params")
    response.sendFile(path.join(__dirname+'/public/bluecross.html'));
}

function blueCrossDb(request, response) {
    handleDatabaseOperation( request, response, function (request, response, connection) {

        // var selectStatement =  "select etl_process, etl_subprocess, user_notification_ind, last_updated_date, last_updated_userid from DSX_ETL_CONTROL";
        console.log('I am here 1 in blueCrossDB')
        
            var options = {
                inReqNo  :   {type: oracledb.NUMBER_TYPE, dir: oracledb.BIND_IN},
                inResult  :   {type: oracledb.CLOB, dir: oracledb.BIND_IN},
                outResponse :   {type: oracledb.CLOB, dir: oracledb.BIND_INOUT},
                outResult :   {type: oracledb.CLOB, dir: oracledb.BIND_INOUT}
        };
        var executeStatement =  "BEGIN  p_db_proc_gateway(:inReqNo,:inResult,:outResponse,:outResult) ; END;";
        console.log('I am here 2 in blueCrossDB')
        
        //var executeStatement =  "BEGIN  P_EXPORT_BLUECROSS_LIST('200609') ; END;";
        connection.execute( executeStatement
              , options  
              , function (err, result) {
                if (err) {
                    console.log('I am here 4 in blueCrossDB')
                    console.log('Error in execution of execute statement'+err.message);
                    response.writeHead(500, {'Content-Type': 'application/json'});
                    response.end(JSON.stringify({
                            status: 500,
                            message: "Error getting the Blue Cross DB",
                            detailed_message: err.message
                        })
                    );
                } else {
                    console.log('I am here 3 in blueCrossDB')
                    console.log('db response is ready ');
                    var lob = result.outBinds.outResult;
                    console.log('db response is ready -- '||lob.toString());
                    if (lob.type === oracledb.CLOB) {
                        console.log('I am here 3.5 in blueCrossDB')
                        lob.setEncoding('utf8');  // set the encoding so we get a 'string' not a 'buffer'
                    }

                    lob.on('error', function(err) { cb(err); });
                    lob.on('close', function() { cb(null); });   // all done.  The Lob is automatically closed.

                    var outStream = fs.createWriteStream('myoutput.txt');
                    outStream.on('error', function(err) { cb(err); });

                     // switch into flowing mode and push the LOB to myoutput.txt
                    lob.pipe(outStream);
                    //response.writeHead(200, {'Content-Type': 'application/json'});

                   // response.end(clob));
                }
                doRelease(connection);
            }
        );

    });
}
function cb(err) {console.log(err)}

// End of BlueCross Modules

// Start of Department module
app.get('/departments', function(req,res){ handleAllDepartments(req, res);} );

app.get('/departments/:departmentId', function(req,res){
    var departmentIdentifier = req.params.departmentId;
    handleDatabaseOperation( req, res, function (request, response, connection) {
        var selectStatement = "SELECT employee_id, first_name, last_name, job_id FROM employees where department_id= :department_id";
        connection.execute( selectStatement
            , [departmentIdentifier], {
                outFormat: oracledb.OBJECT // Return the result as Object
            }, function (err, result) {
                if (err) {
                    console.log('Error in execution of select statement'+err.message);
                    response.writeHead(500, {'Content-Type': 'application/json'});
                    response.end(JSON.stringify({
                            status: 500,
                            message: "Error getting the employees for the department "+departmentIdentifier,
                            detailed_message: err.message
                        })
                    );
                } else {
                    console.log('db response is ready '+result.rows);
                    response.writeHead(200, {'Content-Type': 'application/json'});
                    response.end(JSON.stringify(result.rows));
                }
                doRelease(connection);
            }
        );
    });
} );


function handleAllDepartments(request, response) {
    handleDatabaseOperation( request, response, function (request, response, connection) {
        var departmentName = request.query.name ||'%';

        var selectStatement = "SELECT department_id, department_name FROM departments where department_name like :department_name";
        connection.execute( selectStatement
            , [departmentName], {
                outFormat: oracledb.OBJECT // Return the result as Object
            }, function (err, result) {
                if (err) {
                    console.log('Error in execution of select statement'+err.message);
                    response.writeHead(500, {'Content-Type': 'application/json'});
                    response.end(JSON.stringify({
                            status: 500,
                            message: "Error getting the departments",
                            detailed_message: err.message
                        })
                    );
                } else {
                    console.log('db response is ready '+result.rows);
                    response.writeHead(200, {'Content-Type': 'application/json'});
                    response.end(JSON.stringify(result.rows));
                }
                doRelease(connection);
            }
        );

    });
} //handleAllDepartments

// END of Department module

