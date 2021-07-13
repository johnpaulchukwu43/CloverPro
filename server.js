var express = require('express');
var secret = require('./secret');

var app = express();
var directory = '/' + (process.env.STATIC_DIR || 'app');
app.use(express.static(__dirname + directory));

var port = secret.port || 3000;


app.listen(port, function () {
    console.log('Listening on', port);
});
