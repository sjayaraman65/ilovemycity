let cluster = require('cluster');
console.log("Starting Simple Master Worker1 ")
if (cluster.isMaster) {
    let cpus = 2; //require('os').cpus().length;
    for (let i = 0; i < cpus; i += 1) {
        cluster.fork();
    }
    cluster.on('exit', function (worker) {
        console.log(`worker ${worker.id} exited, respawning...`);
        // cluster.fork();
    });
} else {
    let express = require('express'),
        app = express(),
        port = 8999;
    app.get('/hello', function (req, res) {
        console.log('I am -  worker '+process.pid);
        res.send('Hello World! - '+process.pid);
    });
    app.get('/kill', function (req, res) {
        console.log('I am -  worker '+process.pid)
        res.send('kill option! - '+process.pid);
        process.kill(process.pid);
    });
    app.listen(port);
    console.log(`worker ${cluster.worker.id} is listening on port ${port}...`);
}