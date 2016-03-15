var _ = require('underscore'),
    moment = require('moment-timezone'),
    db = require('./fieldbook'),
    forecast = require('./forecast');

var Recommender = function() {

    this.getRec = function(bot, channel) {

        bot.say({
            type: 'typing',
            channel: channel
        });

        db.getRestaurants(function(restaurants) {
            selectRestaurant(bot, channel, restaurants);
        });
    };

    // PRIVATE

    function selectRestaurant(bot, channel, restaurants) {

        forecast.now(function(inchesOfRain, temperature) {

            var restrictedObject = restrictDistance(restaurants, inchesOfRain, temperature),
                filteredRestaurants = restrictedObject.restaurants,
                message = restrictedObject.message;

            var sorted = sortOldToNew(filteredRestaurants),
                selection = firstMatch(sorted);

            sendSuggestion(bot, channel, selection, message);

            db.updateRestaurant(selection.id, {
                last_rec: moment().tz(process.env.TIMEZONE).format('lll'),
                num_recs: selection.num_recs + 1
            });
        });
    };

    function restrictDistance(restaurants, inchesOfRain, temperature) {

        var limit = 1, // in miles
            message = '';

        if (inchesOfRain > 0.1) { // med-hard rain
            limit = 0;
            message = ' :umbrella:';
        } else if (inchesOfRain > 0.05) { // light rain
            limit = 0.1;
            message = ' :rain_cloud:';
        } else if (temperature < 20) { // freezing
            limit = 0.1;
            message = ' :snowman:';
        } else if (temperature < 30) { // cold
            limit = 0.2;
            message = ' :snowflake:';
        }

        var filteredRestaurants = _.filter(restaurants, function(restaurant) {
            return restaurant.distance <= limit;
        });

        return {
            restaurants: filteredRestaurants,
            message: message
        }
    }

    function sortOldToNew(restaurants) {

        return _.sortBy(restaurants, function(restaurant) {
            if (!restaurant.last_rec) return moment().tz(process.env.TIMEZONE).subtract(1, 'years');
            return moment.tz(restaurant.last_rec, 'lll', process.env.TIMEZONE);
        });
    }

    function firstMatch(restaurants) {

        return _.find(restaurants, function(restaurant) {

            var numRecs = restaurant.num_recs,
                numPassed = restaurant.num_passed || 0;

            if (numRecs < 3) return true; // need at least 3 data points to skip

            var score = 1 - (numPassed / numRecs); // 0 to 1

            if (score < 0.2) return false; // always skip

            return score > Math.random(); // places we go X% of the time are skipped 1-X%
        });
    }

    function sendSuggestion(bot, channel, restaurant, message) {

        var reply = 'How about ' + restaurant.name + '? ' + restaurant.emojis + message;

        bot.api.chat.postMessage({
            text: reply,
            channel: channel,
            as_user: true
        }, function(err, res) {
            if (err) throw err;

            bot.api.reactions.add({
                name: '-1',
                channel: channel,
                timestamp: res.message.ts
            }, function(err, res) {
                if (err) throw err;
            });
        });
    };
};

module.exports = new Recommender();
