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



// pusher.trigger('my-channel', 'my-event', {
//   message: "pizza pizza"
// });


console.log("This is my new branch");

// initialize MongoDB connection
mongoose.connect(config.mongoUrl);

// Create Express web app with some useful middleware
var app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(urlencoded({ extended: true }));
app.use(morgan('combined'));

/*
Generate an Access Token for a sync application user - it generates a random
username for the client requesting a token, and takes a device ID as a query
parameter.

*/
// app.get('/token', function(request, response){
//   var appName = 'TwilioSyncDemo';
//   var identity = randomUsername();
//   console.log(identity);
//   var deviceId = request.query.device;
//
//   // Create a unique ID for the client on their current device
//   var endpointId = `${appName}:${identity}:${deviceId}`;
//   console.log(endpointId);
//
//   // Create a "grant" which enables a client to use Sync as a given user,
//   // on a given device
//   var syncGrant = new SyncGrant({
//     serviceSid: config.service_sid,
//     endpointId: endpointId
//   });
//
//   // Create an access token which we will sign and return to the client,
//   // containing the grant we just created
//   var token = new AccessToken(
//     config.account_sid,
//     config.api_key,
//     config.sync_secret
//   );
//
//   token.addGrant(syncGrant);
//   token.identity = identity;
//   console.log(token);
//   // Serialize the token to a JWT string and include it in a JSON response
//   response.send({
//     identity: identity,
//     token: token.toJwt()
//   });
// });

// Twilio Webhook routes
app.post('/message', message);



// Ajax route to aggregate response data for the UI
app.get('/results', results);

// Create HTTP server and mount Express app
var server = http.createServer(app);
server.listen(config.port, function() {
    console.log('Express server started on *:'+config.port);
});
