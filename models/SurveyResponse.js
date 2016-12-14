var mongoose = require('mongoose');

var SurveyResponseSchema = new mongoose.Schema({
    // phone number of participant
    phone: String,

    // status of the participant's current survey response
    complete: {
        type: Boolean,
        default: false
    },
    // record of answers
    responses: [mongoose.Schema.Types.Mixed]
});

Object.prototype.in = function() {
    for(var i=0; i<arguments.length; i++)
       if(arguments[i] == this) return true;
    return false;
};

SurveyResponseSchema.statics.advanceSurvey = function(args, cb) {
    var surveyData = args.survey;
    var phone = args.phone;
    var input = args.input;
    var surveyResponse;
    var currentQuestion;

    // if(currentQuestion.id === '1' && input.toLowerCase() === 'no'){
    //   console.log("too young");
    //   console.log("responseLength after first answer: " + responseLength);
    //   surveyResponse.complete = true;
    //   console.log("In the young handler and survey complete is: " + surveyResponse.complete);
    // }

    // Find current incomplete survey
    SurveyResponse.findOne({
        phone: phone,
        // complete: false
    }, function(err, doc) {
        surveyResponse = doc || new SurveyResponse({
            phone: phone
        });
        console.log("in the find " + surveyResponse.complete);
        processInput();
    });

    function processInput() {
      var responseLength;


      responseLength = surveyResponse.responses.length;

      var questionResponse = {};

      if(responseLength === 0 || responseLength === 1){
        currentQuestion = surveyData[responseLength];
      }
      // currentQuestion = surveyData[responseLength];

      if(currentQuestion.id === '1' && input.toLowerCase() === 'no'){
        console.log("too young");
        // console.log("responseLength after first answer: " + responseLength);
        surveyResponse.complete = true;
        questionResponse.answer = input;
        surveyResponse.responses.push(questionResponse);
        console.log("In the young handler and survey complete is: " + surveyResponse.complete);
      }

      function reask() {
        cb.call(surveyResponse, null, surveyResponse, responseLength);
      }

      if (!input) return reask();

      // var questionResponse = {};


      if(typeof currentQuestion !== 'undefined' && surveyResponse.complete !== true){
        if(currentQuestion.type === 'boolean') {
          if(input.toLowerCase() !== 'yes' && input.toLowerCase() !== 'no'){
            reask();
          }else {
            var isTrue = input === '1' || input.toLowerCase() === 'yes';
            questionResponse.answer = isTrue;
          }
        } else if (currentQuestion.type === 'number'){
          var num = Number(input);
          if (isNaN(num)) {
            reask();
          } else{
            questionResponse.answer = num;
          }
        }else {
          questionResponse.answer = input;
        }
        questionResponse.type = currentQuestion.type;
        surveyResponse.responses.push(questionResponse);
      }

      if(surveyResponse.responses.length === surveyData.length){
        surveyResponse.complete = true;
        console.log("In the length handler and survey complete is: " + surveyResponse.complete);
      }

      var nextIndex = function(){
        if(currentQuestion.id === '2' && Number(input) < 3){
          nextIndex = 2;
        }else if(currentQuestion.id === '2' && Number(input) > 3){
          nextIndex = 3;
        }else{
          //need next question logic
        }
      };

      surveyResponse.save(function(err) {
        if(err || typeof currentQuestion === 'undefined') {
          console.log("inside the error checker");
          reask();
        }else if(surveyResponse.complete === true){
          console.log("done!");
          cb.call(surveyResponse, err, surveyResponse, null);
        }else if(responseLength.in(0,1,2)){
          console.log("all good and survey complete is: " + surveyResponse.complete);
          cb.call(surveyResponse, err, surveyResponse, responseLength + 1);
        }else{
          cb.call(surveyResponse, err, surveyResponse, nextIndex);
        }
      });
    }
  };

var SurveyResponse = mongoose.model('SurveyResponse', SurveyResponseSchema);
module.exports = SurveyResponse;
