
fs = require('fs');

var checkFile =new Promise (function(resolve,reject)
{
var filename =  '1sync.js';
while (!fs.existsSync(filename))
{
   setTimeout(() => {},1000)
}
console.log('file exists');
fs.readFile(filename, 'utf8', function (err,data) {
    if (err) {
        return console.log(err);
    }
    console.log(data);
    if (data=='OK')
       {console.log('Ok');
        resolve(data);}
    else
    {console.log('NOk');
    reject(data);
    }
});
}
);

function iamOk () { console.log("I am in OK")}
function iamNotOk () { console.log("I am  not in OK")}

checkFile.then (iamOk).catch(iamNotOk);
console.log("I am done ")
