var async = require('async'),
    fs = require('fs');

fs.readdir(process.cwd(), function (err, children) {
    async.map(children, fs.stat, function (err, stats) {
        stats
        // Make sure this is a file. If it isn't, return (undefined).
        // Convert the file stat to an object with name and stat info
            .map(function (stat, index) {
                if (!stat.isFile()) return;
                return {
                    name: children[index],
                    stat: stat
                };
            })
            // Filter out the undefined (and unwanted) values
            .filter(function (val) { return !!val; })
            // Sort the remaining files by size, using the stat object
            .sort(function (a, b) { return a.stat.size - b.stat.size; })
            // Reverse the array so it's descending
            //.reverse()
            // And list 'em out
            .forEach(function (file) {
                console.log('%dB : %s', file.stat.size, file.name);
            });
    });
});