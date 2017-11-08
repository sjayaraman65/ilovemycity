
const asyncFunc = require('async');
function myCallback(err, value) {
    if (err) {
        // handle error
        return; // Returning here is important!
    }
    // Do something with value
}
asyncFunc('foo', 42, myCallback);