var _ = require('underscore'),
    db = require('./fieldbook'),
    recommender = require('./recommender');

var Reacter = function() {

    this.newReaction = function(bot, message) {

        var id = bot.identity.id,
            user = message.user,
            reaction = message.reaction,
            item = message.item,
            channel = item.channel;

        if (id === user || (reaction !== '-1' && reaction !== '+1')) return; // ignore own or invalid reactions

        getChannelItems(bot, channel, function(channelItems) {

            var message = _.findWhere(channelItems, { user: id, ts: item.ts });
            if (!message) return; // too old or not posted by bot

            var name = parseName(message.text);

            if (isPoke(message.text) && reaction === '+1') {

                var numUpvotes = _.find(message.reactions, { name: '+1' }).count;
                if (numUpvotes > 2) return; // ignore subsequent +1's

                recommender.getRec(bot, channel);

            } else if (name && reaction === '-1') {

                var numDownvotes = _.find(message.reactions, { name: '-1' }).count;
                if (numDownvotes > 2) return; // ignore subsequent -1's

                recommender.getRec(bot, channel);
                recordPassOnRestaurant(name);
            }
        });
    };

    this.sendURL = function(bot, message) {

        var channel = message.channel,
            botID = bot.identity.id;

        bot.say({
            type: 'typing',
            channel: channel
        });

        getChannelItems(bot, channel, function(channelItems) {

            var lastRec = getLastRec(channelItems, botID);
            if (!lastRec) return;

            db.getRestaurants(function(restaurants) {

                var restaurant = _.findWhere(restaurants, { name: lastRec });

                var reply = restaurant.yelp_url || "Sorry, I don't have a Yelp link for them :sob:";
                bot.reply(message, reply);
            });
        });
    };

    // PRIVATE

    function getChannelItems(bot, channel, callback) {

        bot.api.channels.history({
            channel: channel
        }, function(err, res) {
            if (err === 'channel_not_found') {

                bot.api.im.history({
                    channel: channel
                }, function(err, res) {
                    if (err) throw err;
                    return callback(res.messages);
                });

            } else {

                if (err) throw err;
                return callback(res.messages);
            }
        });
    }

    function parseName(text) {

        var matches = text.match(/How about ([^?]*)\?/);
        if (!matches) return;

        return matches[1];
    }

    function recordPassOnRestaurant(name) {

        db.getRestaurants(function(restaurants) {
            var restaurant = _.findWhere(restaurants, { name: name });

            db.updateRestaurant(restaurant.id, {
                num_passed: restaurant.num_passed + 1
            });
        });
    }

    function isPoke(text) {

        return text.indexOf(':clock12: :eyes: :speak_no_evil:') > -1;;
    }

    function getLastRec(items, id) {

        var self = this;

        var targetItem = _.find(items, function(item) { return parseName(item.text); });
        if (!targetItem) return;

        return parseName(targetItem.text);
    }
};

module.exports = new Reacter();
