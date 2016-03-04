var requestify = require('requestify');

var Forecast = function() {

    var token = process.env.FORECAST_TOKEN,
        lat = 41.8958754,
        long = -87.637093,
        endpoint = 'https://api.forecast.io/forecast/' + token + '/' + lat + ',' + long;

    this.now = function(callback) {

        requestify.get(endpoint).then(function(res) {

            var data = res.getBody(),
                inchesOfRain = data.currently.precipIntensity,
                temperature = data.currently.apparentTemperature;

            return callback(inchesOfRain, temperature);
        }, function(err) {
            console.log(err.getBody());
        });
    };
};

module.exports = new Forecast();
