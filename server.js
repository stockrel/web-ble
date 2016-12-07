var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var flash    = require('connect-flash');
var http     = require('http');
var https = require('https');
var cors = require('cors');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var fs = require('fs');
var allowCrossDomain = function(req, res, next) {
    //res.header('Access-Control-Allow-Origin', 'http://chain-backoffice.elasticbeanstalk.com');
    res.header('Access-Control-Allow-Origin', 'https://live.wechain.eu');
    res.header('Access-Control-Allow-Credentials',true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept,x-jwt-token,Content-Type,title,latitude,type,longitude,punchline,commentsrestricted,tag,actionbutton,logo,actionbuttondestination');
    next();
}


var options = {
  key: fs.readFileSync('./ssl/key.pem'),
  cert: fs.readFileSync('./ssl/cert.pem'),
  passphrase: 'mimite'
};

var server = https.createServer(options, app);

app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true}));
//app.use(cors());
app.set('view engine', 'ejs'); // set up ejs for templating

app.use(flash()); // use connect-flash for flash messages stored in session
app.use(allowCrossDomain);

app.use(express.static(__dirname + '/')); 

server.listen(443);
console.log("SERVER START : Let's chain on port " + port+"...");
