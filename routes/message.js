var twilio = require('twilio');
var SurveyResponse = require('../models/SurveyResponse');
var survey = require('../survey_data');
var Pusher = require('pusher');
var config = require('../config');

var pusher = new Pusher({
  appId: config.app_id,
  key: config.app_key,
  secret: config.secret_key,
  encrypted: true, // optional, defaults to false
});

module.exports = function(request, response) {
  var phone = request.body.From;
  var input = request.body.Body;

  // function triggerInput(){
  //   pusher.trigger('attendee-response', 'attendee-event', {
  //     input: input,
  //   });
  // }


  function respond(message) {
    var twilio = require('twilio');
    var twiml = new twilio.TwimlResponse();
    twiml.message(message);
    response.type('text/xml');
    response.send(twiml.toString());
  }

  SurveyResponse.findOne({
    phone:phone,
    // complete:false
  }, function(err, doc) {

    if(!doc && input.toLowerCase() === 'hackathon'){
      console.log(input);
      var newSurvey = new SurveyResponse({
      phone:phone,
      complete:false,
    });
      newSurvey.save(function(err, doc) {
        handleNextQuestion(err, doc, 0);
      });
    }else if(doc && doc.complete === true){
      console.log("success!");
      var messageComplete = "Thank you for taking our survey!";
      return respond(messageComplete);
    }else if(doc){
    SurveyResponse.advanceSurvey({
      phone:phone,
      input:input,
      survey:survey
    }, handleNextQuestion);
  }else {
    return respond('Please text "hackathon" if you would like to take our survey.');
  }
  });


  function handleNextQuestion(err, surveyResponse, questionIndex) {
    var question = survey[questionIndex];
    if(questionIndex === 1 && input.toLowerCase() === 'yes'){
      pusher.trigger('attendee-response', 'attendee-event', {
        input: input.toLowerCase(),
      });
    }

    if(surveyResponse.responses.length === 4){
      console.log(questionIndex + ' is the actaul index');
      console.log(input + ' is the input');
      pusher.trigger('entireEvent-response', 'entire-event', {
        input: input.toLowerCase(),
      });
    }

    if(surveyResponse.responses.length === 2){
      console.log(question.id + " is the id for the number trigger");
      console.log(input + " is the input for the number trigger");
      pusher.trigger('number-response', 'number-event', {
        input: input,
      });
    }


    var responseMessage = '';
    // console.log(questionIndex);

    if(err || !surveyResponse) {
      return respond("Sorry but an error has occured" + "Please submit your answer again");
    }

    if(questionIndex >= survey.length + 1){
      return respond("Looks like you have completed our survey already! Thanks and have a great day!");
    }

    if(!question || questionIndex === null) {
      return respond("Thanks again and we hope to see you at the next Twilio hackathon where doers are always welcome!");
    }

    if(questionIndex === 0) {
      responseMessage+= 'Thank you for taking our survey!';
    }

    responseMessage+= question.text;

    if(question.type === 'boolean') {
      responseMessage+= ' Type yes or no';
    }

    respond(responseMessage);
  }

};
