var twilio = require('twilio');
var SurveyResponse = require('../models/SurveyResponse');
var survey = require('../survey_data');

module.exports = function(request, response) {
  var phone = request.body.From;
  var input = request.body.Body;

  function respond(message) {
    var twilio = require('twilio');
    var twiml = new twilio.TwimlResponse();
    twiml.message(message);
    response.type('text/xml');
    response.send(twiml.toString());
  }

  SurveyResponse.findOne({
    phone:phone,
    complete:false
  }, function(err, doc) {
    if(!doc){
      var newSurvey = new SurveyResponse({
      phone:phone
    });
    newSurvey.save(function(err, doc) {
      handleNextQuestion(err, doc, 0);
    });
  }else {
    SurveyResponse.advanceSurvey({
      phone:phone,
      input:input,
      survey:survey
    }, handleNextQuestion);
  }
  });

  function handleNextQuestion(err, surveyResponse, questionIndex) {
    var question = survey[questionIndex];
    var responseMessage = '';

    if(err || !surveyResponse) {
      return respond("Sorry but an error has occured" + "Please submit your answer again");
    }

    if(!question) {
      return respond("Thanks you for taking our survey!");
    }

    if(questionIndex === 0) {
      responseMessage+= 'Thank you for taking our survey!';
    }

    responseMessage+= question.text;

    if(question.type === 'boolean') {
      responseMessage+= 'Type yes or no';
    }

    respond(responseMessage);
  }

};
