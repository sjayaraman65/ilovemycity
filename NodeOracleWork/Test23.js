const cluster = require('cluster');
const http = require('http');
const numCPUs = 1; //require('os').cpus().length;

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    // Fork workers.
    //for (let i = 0; i < numCPUs; i++) {
    //    cluster.fork();
    //}
    worker=cluster.fork();

    worker.on("exit", function() {
        // do stuff
        console.log("test");
        process.exit();
    });
} else {
    // Workers can share any TCP connection
    // In this case it is an HTTP server
    http.createServer((req, res) => {
        res.writeHead(200);
    res.end('hello world\n');
}).listen(8900);

    console.log(`Worker ${process.pid} started`);
}