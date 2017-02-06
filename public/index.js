

$(function() {
    attendees();
    entireEvent();
    yearsCoding();
    freeText();
    var pusher;
    // Enable pusher logging - don't include this in production
    Pusher.logToConsole = true;





    // Chart attendees
    function attendees() {

        pusher = new Pusher('397476e7b9e8029d8307', {
        encrypted: true
        });
        var channel = pusher.subscribe('attendee-response');
        var total = {};
        var dataSet = [];

        var k = 'true';
        total[k] = 1;
        dataSet.push(total[k]);
        var labels = Object.keys(total);

        var ctx = document.getElementById('attendeeChart').getContext('2d');
        var attendeeChart = new Chart(ctx).Bar({
            labels: labels,
            datasets: [
                {
                    label: 'Attendees',
                    data: dataSet,
                    fillColor: '#133A65',
                    borderWidth: 0.5,

                }
            ]
        });

        channel.bind('attendee-event', function(data) {
        if(data.input === 'yes'){
          k = 'true';
          console.log(k);
        }else{
          k = 'false';
        }

        if(k !== 'false'){
          if (!total[k]){
            total[k] = 1;
          }else{
            dataSet[0]++;
          }
        }


        console.log("Label is " + labels);
        console.log(total);
        console.log(dataSet[0]);

        var ctx = document.getElementById('attendeeChart').getContext('2d');
        var attendeeChart = new Chart(ctx).Bar({
            labels: labels,
            datasets: [
                {
                    label: 'Attendees',
                    data: dataSet,
                    fillColor: '#133A65',
                    borderWidth: 0.5,

                }
            ]
        });
        });
    }

    // Chart yes/no responses to event duration question
    function entireEvent() {


        // Collect  results
        var yes = 1, no = 1;
        var ctx = document.getElementById('eventChart').getContext('2d');
        var eventChart = new Chart(ctx).Pie([
            { value: yes, label: 'Yes', color: '#1ABC9C', highlight: '#bcddd7' },
            { value: no, label: 'No', color: '#E84C3D', highlight: '#FBC7C1' }
        ]);

        var eventChannel = pusher.subscribe('entireEvent-response');

        eventChannel.bind('entire-event', function(data){
          var answer = data.input;
          console.log(answer);
          if(answer === 'yes'){
            yes++;
          }else{
            no++;
          }

          var ctx = document.getElementById('eventChart').getContext('2d');
          var eventChart = new Chart(ctx).Pie([
              { value: yes, label: 'Yes', color: '#1ABC9C', highlight: '#bcddd7' },
              { value: no, label: 'No', color: '#E84C3D', highlight: '#FBC7C1' }
          ]);
        });

    }

    function yearsCoding(){
      var underThree = 1, threeAndOver = 0;

      var ctx = document.getElementById('yearsChart').getContext('2d');
      var eventChart = new Chart(ctx).Doughnut([
          { value: threeAndOver, label: '3 years+', color: '#A3DFBD', highlight: '#E9F2F6' },
          { value: underThree, label: 'Less than 3 years ', color: '#FFB14E', highlight: '#FFDBB7' }
      ]);

      var numberChannel = pusher.subscribe('number-response');

      numberChannel.bind('number-event', function(data){
        var years = data.input;

        if(years < 3){
          underThree++;
        }else{
          threeAndOver++;
        }
        var ctx = document.getElementById('yearsChart').getContext('2d');
        var eventChart = new Chart(ctx).Doughnut([
            { value: threeAndOver, label: '3 years+', color: '#A3DFBD', highlight: '#E9F2F6' },
            { value: underThree, label: 'Less than 3 years ', color: '#FFB14E', highlight: '#FFDBB7' }
        ]);

      });

    }


    function row(response) {
        var tpl = '<li class="list-group-item">';
          tpl += response;
          tpl += '</li>';
          return tpl;
    }

    // add text responses to a list
    function freeText() {
        var $feedbackresponses = $('#feedbackResponses');
        var $topicresponses = $('#topicResponses');
        var $levelresponses = $('#levelResponses');
        var content = '';
        var levelContent = '';
        var phonenumbers = [];

        var textChannel = pusher.subscribe('text-response');

        textChannel.bind('text-event', function(data){
          console.log(data.input + ' is the text input');
          console.log(data.id + ' is the question');
          var id = data.id;
          var answer = data.input;
          if(answer.toLowerCase() !== 'skip'){
            if(id === '9'){
              content += row(answer);
              $topicresponses.append(content);
            }else{
              content += row(answer);
              $feedbackresponses.append(content);
            }
          }
        });

        var levelChannel = pusher.subscribe('level-response');

        levelChannel.bind('level-event', function(data){
          var levelAnswer = data.input;
          console.log(levelAnswer);
          levelContent += row(levelAnswer);
          $levelresponses.append(levelContent);
        });
    }
});
