

$(function() {

    // Chart attendees
    function attendees(results) {
        // Collect attendee results
        var data = {};
        for (var i = 0, l = results.length; i<l; i++) {
            var attendeeResponse = results[i].responses[0];
            var k = String(attendeeResponse.answer);
            if (!data[k]) data[k] = 1;
            else data[k]++;
        }

        // Assemble for graph
        var labels = Object.keys(data);
        var dataSet = [];
        for (var k in data)
            dataSet.push(data[k]);

        // Render chart
        var ctx = document.getElementById('attendeeChart').getContext('2d');
        var attendeeChart = new Chart(ctx).Bar({
            labels: labels,
            datasets: [
                {
                    label: 'Attendees',
                    data: dataSet,
                    fillColor: 'rgba(75, 192, 192, 0.3)',
                    borderWidth: 0.5,

                }
            ]
        });
    }

    // Chart yes/no responses to event duration question
    function entireEvent(results) {
        // Collect  results
        var yes = 0, no = 0;
        for (var i = 0, l = results.length; i<l; i++) {
            var eventResponse = results[i].responses[3];
            eventResponse.answer ? yes++ : no++;
        }

        var ctx = document.getElementById('eventChart').getContext('2d');
        var eventChart = new Chart(ctx).Pie([
            { value: yes, label: 'Yes', color: '#1ABC9C', highlight: '#bcddd7' },
            { value: no, label: 'No', color: '#E84C3D', highlight: '#FBC7C1' }
        ]);
    }

    function yearsCoding(results){
      var underThree = 0, threeAndOver = 0;

      for(var i=0,l = results.length; i<l; i++){
        var yearsResponse = results[i].responses[1];
        if(yearsResponse.answer < 3){
          underThree++;
        }else{
          threeAndOver++;
        }
      }

      var ctx = document.getElementById('yearsChart').getContext('2d');
      var eventChart = new Chart(ctx).Doughnut([
          { value: threeAndOver, label: '3 years+', color: '#A3DFBD', highlight: '#E9F2F6' },
          { value: underThree, label: 'Less than 3 years ', color: '#FFB14E', highlight: '#FFDBB7' }
      ]);
    }

    // poor man's html template for a response table row
    // function row(response) {
    //     var tpl = '<tr><td>';
    //     tpl += response.answer || 'pending...' + '</td>';
    //
    //     tpl += '<td></td>';
    //
    //     tpl += '</tr>';
    //     return tpl;
    // }

    function row(response) {
        var tpl = '<li class="list-group-item">';
          tpl += response.answer;
          tpl += '</li>';
          return tpl;
    }

    // add text responses to a list
    function freeText(results) {
        var $feedbackresponses = $('#feedbackResponses');
        var $topicresponses = $('#topicResponses');
        var $levelresponses = $('#levelResponses');
        var content = '';
        var levelContent = '';
        var phonenumbers = [];


        for (var i = 0, l = results.length; i<l; i++) {
          var thisPhone = results[i].phone;
          console.log(thisPhone);


          if(phonenumbers.includes(thisPhone) !== true){

            console.log(phonenumbers.includes(thisPhone));
            console.log(phonenumbers);
            var lastIndex = results[i].responses.length - 1;
            var textResponse = results[i].responses[lastIndex];
            var levelResponse = results[i].responses[2];


            if(results[i].responses[lastIndex].id === '8' && results[i].responses[lastIndex].answer !== undefined){
              content += row(textResponse);
              $feedbackresponses.html(content);

              console.log(results[i].responses[lastIndex].answer + ' is the answer');

            }else{
              if(results[i].responses[lastIndex].answer !== undefined){
                content += row(textResponse);
                console.log(results[i].responses[lastIndex].answer + ' is the topic');
                $topicresponses.html(content);
              }


            }
            console.log(results[i].responses[2].answer);
            if(results[i].responses[2].answer !== undefined){
              levelContent += row(levelResponse);
              $levelresponses.html(levelContent);
            }

            phonenumbers.push(thisPhone);
          }else{
            continue;
          }

        }
    }




    // Load current results from server
    $.ajax({
        url: '/results',
        method: 'GET'
    }).done(function(data) {
        // Update charts and tables
        $('#total').html(data.results.length);
        entireEvent(data.results);
        attendees(data.results);
        freeText(data.results);
        yearsCoding(data.results);
    }).fail(function(err) {
        console.log(err);
        alert('failed to load results data :(');
    });
});
