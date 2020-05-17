var http = require('http');
// var path = require('path');
// var bodyParser = require('body-parser');
// var urlParser = require('url');
var app = require('./src');


app(function (obj) {
	console.log(obj);
});


// var server = http.createServer(function (req, res) {

// });

// server.listen(2306, function () {
// 	console.log('MU2306');
// });