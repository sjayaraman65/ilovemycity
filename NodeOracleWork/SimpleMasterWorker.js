let cluster = require('cluster');
if (cluster.isMaster) {
    let cpus = 1; //require('os').cpus().length;
    for (let i = 0; i < cpus; i += 1) {
        cluster.fork();
    }
    // When the worker goes online (pre worker trigger)
    cluster.on('online', function (worker) {
        console.log(`worker ${worker.id} - ${worker.process.pid} online no ...`);
        worker.send('Sent to worker : Hello')
    });

    // when the worker exits (post worker trigger)
    cluster.on('exit', function (worker) {
        console.log(`worker ${worker.id} - ${worker.process.pid} exited, respawning...`);
        cluster.fork();
    });

    // when the worker sends the  message
    cluster.on('messaqe', function (message) {
            console.log('Recd message from worker ' + message);
        }
    );
} else {

    console.log("1 I am in worker");

    // on receiving message from process
    process.on('message', function (message) {
            console.log('1 Recd message from Process ' + message);
            process.send('From worker with love')
        }
    )
}
