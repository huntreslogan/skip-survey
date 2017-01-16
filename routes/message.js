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
    return respond('Please text hackathon if you would like to take our survey.');
  }
  });


  function handleNextQuestion(err, surveyResponse, questionIndex) {
    var question = survey[questionIndex];
    var responseMessage = '';
    // console.log(questionIndex);

    if(err || !surveyResponse) {
      return respond("Sorry but an error has occured" + "Please submit your answer again");
    }

    if(questionIndex >= survey.length + 1){
      return respond("Looks like you have completed our survey already! Thanks and have a great day!");
    }

    if(!question || questionIndex === null) {
      return respond("Thank you for taking our survey!");
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
