var mongoose = require('mongoose');

var SurveyResponseSchema = new mongoose.Schema({
    // phone number of participant
    phone: String,

    // status of the participant's current survey response
    complete: {
        type: Boolean,
        default: false
    },

    skipQuestion: {
      type: Number,
      default: null
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

    // var skipQuestion;

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
      var skipQuestion;

      responseLength = surveyResponse.responses.length;
      console.log(responseLength + " is the length now");

      var questionResponse = {};

      //still need to figure out how to set the currentQuestion value when in the skip logic
      //can't select from the surveyData based on the length of responses
      //need to alter this to take the current question in the surveydata and use that with the input in this conditional to select the right index to return for
      //the next question in our surveyData
      //this index for the next question in our skip logic is especially important when we pass it as the last argument in our callback (nextIndex) contained in the save

      if(currentQuestion && typeof currentQuestion.id !== 'undefined' && surveyResponse.complete !== true && responseLength > 1){
        if(currentQuestion.id === 2 && Number(input) < 3){
          skipQuestion =  2;
        }else if(currentQuestion.id === 2 && Number(input) >3){
          skipQuestion = 3;
        }else{
          skipQuestion = 4;
        }
        currentQuestion = surveyData[skipQuestion];
      }

      if(responseLength === 0 || responseLength === 1){
        currentQuestion = surveyData[responseLength];
        console.log(currentQuestion.id + ' is the currentQuestion');
      }

      function reask() {
        cb.call(surveyResponse, null, surveyResponse, responseLength);
      }

      if (!input) return reask();


      if(typeof currentQuestion !== 'undefined' && surveyResponse.complete !== true){

        if(currentQuestion.type === 'boolean') {
          if(input.toLowerCase() !== 'yes' && input.toLowerCase() !== 'no'){
            reask();
          }else {
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
        }else {
          questionResponse.answer = input;
        }
        questionResponse.type = currentQuestion.type;
        questionResponse.id = currentQuestion.id;
        surveyResponse.responses.push(questionResponse);

      }

      if(surveyResponse.responses.length === surveyData.length){
        surveyResponse.complete = true;
        console.log("In the length handler and survey complete is: " + surveyResponse.complete);
      }

        var current;

        if(responseLength < 1 && current === 2 && Number(input) < 3){
          skipQuestion =  2;
        }else if(responseLength < 1 && current === 2 && Number(input) >3){
          skipQuestion = 3;
        }else{
          skipQuestion = 4;
        }




      //the surveyresponse is saved and after that is completed the callback is executed
      //this is where the handleNextQuestion callback function is called and the index of the next question is passed
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
        }else{
          //was determining the nextIndex here and then passing to the callback handleNextQuestion but anything set in this save won't be accessible anywhere else in the code
          //I was hoping to be able to pass this as the index for the next question in the skip logic here, but also save it to a global variable so that I can use it
          //to set the currentQuestion variable earlier on in the processInput function
          console.log("Skip time and survey complete is: " + surveyResponse.complete + ' and response length = ' + responseLength);
            nextIndex = (function(){
             if(currentQuestion.id === '2' && Number(input) < 3){
               return 2;
             }else if(currentQuestion.id === '2' && Number(input) > 3){
               return 3;
             }else{
               //need next question logic
               console.log('hi');
               return 4;
             }
            })();
          cb.call(surveyResponse, err, surveyResponse, nextIndex);
        }
      });
    }
  };

var SurveyResponse = mongoose.model('SurveyResponse', SurveyResponseSchema);
module.exports = SurveyResponse;
