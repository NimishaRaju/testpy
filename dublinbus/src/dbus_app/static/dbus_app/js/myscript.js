document.addEventListener("DOMContentLoaded", function(event) {
  // ------------------------------------Code to  access the CSRF token from JS
  // using jQuery
  function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
        var cookie = jQuery.trim(cookies[i]);
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }
  var csrftoken = getCookie('csrftoken');

  function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
  }
  $.ajaxSetup({
    beforeSend: function(xhr, settings) {
      if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
        xhr.setRequestHeader("X-CSRFToken", csrftoken);
      }
    }
  });

  // --------------------------------------------------------Start of actual JS
  // Set up the map with desired properties
  function myMap() {
    var myCenter = {
      lat: 53.349605,
      lng: -6.264175
    };
    var mapCanvas = document.getElementById("map");
    var mapOptions = {
      center: myCenter,
      zoom: 14
    };
    var map = new google.maps.Map(mapCanvas, mapOptions);
    infowindow = new google.maps.InfoWindow({
      maxWidth: 355
    });

    // AJAX - Fetch real-time weather data on page load
    // refresh every 600 sec using Immediately-Invoked Function Expression
    // reference https://codeburst.io/javascript-what-the-heck-is-an-immediately-invoked-function-expression-a0ed32b66c18
    (function displayWeather() {
      $.ajax({
        type: "POST",
        url: "weather_route/",
        data: {
          csrfmiddlewaretoken: csrftoken
        },
        success: function(weatherResponse) {
          // Insert error handling here --> check JSON length
          if (weatherResponse.length < 1) {
            window.alert("Error!")
          } else {
            console.log("Weather refreshed!")
            $("#coverage").html("Current weather: " + weatherResponse.weather[0].main);
            $("#temp").html("Temperature: " + weatherResponse.main.temp + " °C");
            $("#wind").html("Wind speed: " + weatherResponse.wind.speed + " km/h");
          }
        }
      })
      setTimeout(displayWeather, 600000);
    })();
  }
  // ----------------------------------------------------------- end of mymap()


  // Triggered whenever user clicks on "Enter starting point" field to enter the source --> 'real-time' mode
  // Get latitude and longitude for the selected source address
  function sourceinfo() {
    var input = document.getElementById('searchTextField');
    var autocomplete = new google.maps.places.Autocomplete(input);
    google.maps.event.addListener(autocomplete, 'place_changed', function() {
      var place = autocomplete.getPlace();
      var latitude1 = place.geometry.location.lat();
      var longitude1 = place.geometry.location.lng();
    });
  }

  // Triggered whenever user clicks on "Enter ending point" field to enter the destination --> 'real-time' mode
  // Get latitude and longitude for the selected destination address
  function destinfo() {
    var input = document.getElementById('searchTextField2');
    var autocomplete = new google.maps.places.Autocomplete(input);
    google.maps.event.addListener(autocomplete, 'place_changed', function() {
      var place = autocomplete.getPlace();
      var latitude2 = place.geometry.location.lat();
      var longitude2 = place.geometry.location.lng();
    });
  }

  // Sends async request to Django server --> get response, show data and trigger showRoutes(coordinates)
  function show_data() {
    var start = document.getElementById('searchTextField').value;
    var destination = document.getElementById('searchTextField2').value;
    // AJAX - get route data from Google
    $.ajax({
      type: "POST",
      url: 'ajax_route/',
      data: {
        start: start,
        destination: destination,
        csrfmiddlewaretoken: csrftoken
      },
      success: function(response) {
        // Insert error handling here --> check JSON length
        if (response.length < 1) {
          window.alert("Error!")
        } else {
          console.log(response);
          // var myVar = JSON.stringify(response, null, 2); // spacing level = 2
          // document.getElementById('showdata').innerHTML = response['routes'];
          $("#start_address").html("Starting at: " + response.routes[0].legs[0].start_address);
          $("#end_address").html("Arriving at: " + response.routes[0].legs[0].end_address);
          $("#distance").html("Distance to cover: " + response.routes[0].legs[0].distance.text);
          $("#duration").html("Travel time: " + response.routes[0].legs[0].duration.text);

          var coordinates = new Array(4);
          coordinates[0] = response.routes[0].legs[0].start_location.lat;
          coordinates[1] = response.routes[0].legs[0].start_location.lng;
          coordinates[2] = response.routes[0].legs[0].end_location.lat;
          coordinates[3] = response.routes[0].legs[0].end_location.lng;

          showRoutes(coordinates);
        }
      }
    });
  }

  // Show route on the map
  // Takes coordinates of source and dest from show_data()
  function showRoutes(coordinates) {
    var directionsDisplay = new google.maps.DirectionsRenderer;
    var directionsService = new google.maps.DirectionsService;

    var myCenter = {
      lat: 53.349605,
      lng: -6.264175
    };
    var mapCanvas = document.getElementById("map");
    var mapOptions = {
      center: myCenter,
      zoom: 14
    };
    var map = new google.maps.Map(mapCanvas, mapOptions);
    infowindow = new google.maps.InfoWindow({
      maxWidth: 355
    });

    directionsDisplay.setMap(map);

    directionsService.route({
      origin: {
        lat: coordinates[0],
        lng: coordinates[1]
      },
      destination: {
        lat: coordinates[2],
        lng: coordinates[3]
      },
      travelMode: google.maps.TravelMode['TRANSIT']
    }, function(response, status) {
      if (status == 'OK') {
        directionsDisplay.setDirections(response);
      } else {
        window.alert('Alert! Error type: ' + status);
      }
    });
  }

  myMap();
  document.getElementById('searchTextField').addEventListener("click", sourceinfo());
  document.getElementById('searchTextField2').addEventListener("click", destinfo());
  document.getElementById('myButton').addEventListener("click", function() {
    show_data()
  });
});
