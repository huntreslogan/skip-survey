

$(function() {

    function fetchAccessToken(handler) {
      // We use jQuery to make an Ajax request to the server to retrieve our
      // Access Token
      $.getJSON('/token', {
          // we pass along a "device" query parameter to identify the device we
          // are connecting from. You would also pass along any other info needed for
          // your server to establish the identity of the client
          device: 'browser'
      }, function(data) {




          // The data sent back from the server should contain a long string, which
          // is the token you'll need to initialize the SDK. This string is in a format
          // called JWT (JSON Web Token) - more at http://jwt.io
          // console.log(data.token);

          // Since the starter app doesn't implement authentication, the server sends
          // back a randomly generated username for the current client, which is how
          // they will be identified while sending messages. If your app has a login
          // system, you should use the e-mail address or username that uniquely identifies
          // a user instead.
          console.log(data.identity);

          handler(data);
      });
    }

    function initializeSync(data) {
      console.log(data.token);
      var accessManager = new Twilio.AccessManager(data.token);
      // console.log(Object.keys(accessManager));
      var syncClient = new Twilio.Sync.Client(data.token);
      // console.log('Sync Initialized!');
      accessManager.on('tokenExpired', refreshToken);
      function refreshToken() {
        fetchAccessToken(setNewToken);
      }
      //Give Access Manager the new token
      // function setNewToken(tokenResponse) {
      //   accessManager.updateToken(tokenResponse.token);
      // }
      //Need to update the Sync Client that the accessManager has a new token
      // accessManager.on('tokenUpdated', function() {
      //   syncClient.updateToken(tokenResponse.token);
      // });

      // Use syncClient here
    }

    fetchAccessToken(initializeSync);


    //Generate random UUID to identify this browser tab
    //For a more robust solution consider a library like
    //fingerprintjs2: https://github.com/Valve/fingerprintjs2
    function getDeviceId() {
      return 'browser-' +
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
           var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
           return v.toString(16);
         });
    }

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
