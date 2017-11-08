var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

app.get('/scrape', function(req, res){
    console.log('I am here 1')
    url = 'http://www.imdb.com/title/tt1229340/';
    console.log('I am here 2')

    request(url, function(error, response, html){
        if(!error){
            console.log('I am here 3')

            var $ = cheerio.load(html);
            console.log('I am here 3.5'+html)

            var title, release, rating;
            var json = { title : "", release : "", rating : ""};

            $('.header').filter(function(){
                var data = $(this);
                title = data.children().first().text();

                // We will repeat the same process as above.  This time we notice that the release is located within the last element.
                // Writing this code will move us to the exact location of the release year.

                release = data.children().last().children().text();

                json.title = title;

                // Once again, once we have the data extract it we'll save it to our json object

                json.release = release;

                console.log(title);
                console.log(release);
            })
        }
    })
})

app.listen('8091')
console.log('Magic happens on port 8081');
exports = module.exports = app;