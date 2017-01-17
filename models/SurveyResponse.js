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
    var currentQuestion;
    var nextIndex;


    // Find current incomplete survey
    SurveyResponse.findOne({
        phone: phone,
    }, function(err, doc) {
        surveyResponse = doc || new SurveyResponse({
            phone: phone
        });
        console.log("in the find " + surveyResponse.complete);
        processInput();
    });



    function processInput() {
      var responseLength;
      var skipQuestion;
      var previous;

      responseLength = surveyResponse.responses.length;
      console.log(responseLength + " is the length now");

      var questionResponse = {};

      if(responseLength <=1 ){

        currentQuestion = surveyData[responseLength];
        console.log('not good');
      }else if(responseLength === 2 && surveyResponse.responses[responseLength - 1].answer < 3){
        currentQuestion = surveyData[2];
        console.log(currentQuestion.id + " is the id when setting the currentQuestion");
      }else if(responseLength === 2 && surveyResponse.responses[responseLength - 1].answer >= 3){
        currentQuestion = surveyData[3];
      }else if (responseLength === 3){
        currentQuestion = surveyData[4];
      }else if(responseLength === 4 && surveyResponse.responses[responseLength - 1].answer === true){
        currentQuestion = surveyData[6];
      }else if(responseLength === 4 && surveyResponse.responses[responseLength - 1].answer === false){
        currentQuestion = surveyData[5];
      }else if (responseLength === 4 && input.toLowerCase() === 'yes') {
        return 8;
      }else if(responseLength === 4 && input.toLowerCase() === 'no'){
        return 7;
      }else{
        return null;
      }
      // currentQuestion = surveyData[responseLength];

      if(responseLength > 1 && currentQuestion && surveyResponse.complete !== true){
        previous = surveyResponse.responses[responseLength - 1].id;
        console.log(previous + ' is the last question asked');
      }

      function reask() {
        cb.call(surveyResponse, null, surveyResponse, responseLength);
      }

      if (!input) return reask();


      if(typeof currentQuestion !== 'undefined' && surveyResponse.complete !== true){

        if(currentQuestion.type === 'boolean') {
          if(input.toLowerCase() !== 'yes' && input.toLowerCase() !== 'no'){
            reask();
          }else if(currentQuestion.id === '1' && input.toLowerCase() === 'no'){
            surveyResponse.complete = true;
          }else{
            var isTrue = input === '1' || input.toLowerCase() === 'yes';
            questionResponse.answer = isTrue;
            console.log("just asked a boolean");
          }
        } else if (currentQuestion.type === 'number'){
          var num = Number(input);
          if (isNaN(num)) {
            reask();
          } else{
            questionResponse.answer = num;
          }
        }else if(input.toLowerCase() !== 'skip' && currentQuestion.type === 'text'){
          questionResponse.answer = input;
        }else {
          console.log('skipping to the end');
          surveyResponse.complete = true;

        }
        questionResponse.type = currentQuestion.type;
        questionResponse.id = currentQuestion.id;
        console.log(questionResponse.id + ' is the id for the currentQuestion.');
        surveyResponse.responses.push(questionResponse);

      }

      if(surveyResponse.responses.length === surveyData.length){
        surveyResponse.complete = true;
        console.log("In the length handler and survey complete is: " + surveyResponse.complete);
      }

      surveyResponse.save(function(err) {
        if(err || typeof currentQuestion === 'undefined') {
          console.log("inside the error checker");
          reask();
        }else if(surveyResponse.complete === true){
          console.log("done!");
          cb.call(surveyResponse, err, surveyResponse, null);
        }else if(responseLength === 0){
          console.log("all good and survey complete is: " + surveyResponse.complete + ' and response length = ' + responseLength);
          cb.call(surveyResponse, err, surveyResponse, responseLength + 1);
        }else if(responseLength >= 1){
          console.log("Skip time and survey complete is: " + surveyResponse.complete + ' and response length = ' + responseLength);
            nextIndex = (function(){
             if(surveyResponse.responses[responseLength].id === '2' && Number(input) < 3){
               return 2;
             }else if(surveyResponse.responses[responseLength].id === '2' && Number(input) >= 3){
               return 3;
             }else if (responseLength === 2){
               return 4;
             }else if(responseLength === 3 && input.toLowerCase() === 'yes'){
               return 6;
             }else if(responseLength === 3 && input.toLowerCase() === 'no'){
               return 5;
             }else if (responseLength === 4 && input.toLowerCase() === 'yes') {
               return 8;
             }else if(responseLength === 4 && input.toLowerCase() === 'no'){
               return 7;
             }else{
               return null;
             }
            })();

          console.log(nextIndex);
          cb.call(surveyResponse, err, surveyResponse, nextIndex);
        }
      });
    }
  };

var SurveyResponse = mongoose.model('SurveyResponse', SurveyResponseSchema);
module.exports = SurveyResponse;
