var http = require('http');
var path = require('path');
var express = require('express');
var morgan = require('morgan');
var mongoose = require('mongoose');
var urlencoded = require('body-parser').urlencoded;
var config = require('./config');
var message = require('./routes/message');
var results = require('./routes/results');
var AccessToken = require('twilio').jwt.AccessToken;
var SyncGrant = AccessToken.SyncGrant;
var randomUsername = require('./randos');
var Pusher = require('pusher');

var pusher = new Pusher({
  appId: config.app_id,
  key: config.app_key,
  secret: config.secret_key,
  encrypted: true, // optional, defaults to false
});



console.log("This is my new branch");

// initialize MongoDB connection
mongoose.connect(config.mongoUrl);

// Create Express web app with some useful middleware
var app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(urlencoded({ extended: true }));
app.use(morgan('combined'));

// Twilio Webhook routes
app.post('/message', message);
// Ajax route to aggregate response data for the UI
app.get('/results', results);

app.get('/getkey', function(req,res){
  res.send(config.app_key);
});

// Create HTTP server and mount Express app
var server = http.createServer(app);
server.listen(config.port, function() {
    console.log('Express server started on *:'+config.port);
});
