var librato = require('librato-node');
var request = require('request');

librato.configure({email: process.env.LIBRATO_USER, token: process.env.LIBRATO_TOKEN});
librato.start();

process.once('exit', function() {
  librato.stop();
});

var registerOutsideTemperature = function() {
  var url = 'http://api.openweathermap.org/data/2.5/weather?q='+process.env.ZIPCODE+'&units=metric';

  request(url, function(error, response, body) {
    if(!error && response.statusCode == 200) {
      data = JSON.parse(body);
      var outsideTemp = data['main']['temp'];
      var outsideHumidity = data['main']['humidity'];
      var outsidePressure = data['main']['pressure'];

      librato.timing('prod.home.drcp.temp.outside', outsideTemp);
      librato.timing('prod.home.drcp.humidity.outside', outsideHumidity);
      librato.timing('prod.home.drcp.pressure.outside', outsidePressure);
    }
  })
}

var collectStatsAndFlush = function() {
  registerOutsideTemperature()
  librato.flush();
}

setInterval(collectStatsAndFlush, 600000);
