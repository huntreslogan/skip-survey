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


SurveyResponseSchema.statics.advanceSurvey = function(args, cb) {
    var surveyData = args.survey;
    var phone = args.phone;
    var input = args.input;
    var surveyResponse;

    // Find current incomplete survey
    SurveyResponse.findOne({
        phone: phone,
        complete: false
    }, function(err, doc) {
        surveyResponse = doc || new SurveyResponse({
            phone: phone
        });
        processInput();
    });

    function processInput() {
      var responseLength = surveyResponse.responses.length;
      var currentQuestion = surveyData[responseLength];

      function reask() {
        cb.call(surveyResponse, null, surveyResponse, responseLength);
      }

      if (!input) return reask();

      var questionResponse = {};

      if (currentQuestion.type === 'boolean') {
        var isTrue = input === '1' || input.toLowerCase() === 'yes';
        questionResponse.answer = isTrue;
      } else if (currentQuestion.type === 'number'){
        var num = Number(input);
        if (isNaN(num)) {
          reask();
        } else{
          questionResponse.answer = num;
        }
      } else {
        questionResponse.answer = input;
      }

      questionResponse.type = currentQuestion.type;
      surveyResponse.responses.push(questionResponse);

      if (surveyResponse.responses.length === surveyData.length){
        surveyResponse.complete = true;
      }

      surveyResponse.save(function(err) {
        if(err) {
          reask();
        }else {
          cb.call(surveyResponse, err, surveyResponse, responseLength + 1);
        }
      });
    }
  };

var SurveyResponse = mongoose.model('SurveyResponse', SurveyResponseSchema);
module.exports = SurveyResponse;
