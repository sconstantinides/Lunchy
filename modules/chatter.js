var _ = require('underscore');

var Chatter = function() {

    this.poke = function(bot) {

        var pokes = [
            "Who's getting hungry?",
            "Tick tock, is it lunch o'clock?",
            "Anyone else ready for some food?",
            "Did I just hear a tummy grumble?"
        ];

        bot.api.chat.postMessage({
            text: _.sample(pokes) + ' :clock12: :eyes: :speak_no_evil:',
            channel: process.env.CRON_CHANNEL,
            as_user: true
        }, function(err, res) {
            if (err) throw err;

            bot.api.reactions.add({
                name: '+1',
                channel: process.env.CRON_CHANNEL,
                timestamp: res.message.ts
            }, function(err, res) {
                if (err) throw err;
            });
        });
    };

    this.tellJoke = function(bot, message) {

        bot.say({
            type: 'typing',
            channel: message.channel
        });

        var jokes = [
            "Why'd the taco cross the road? That's nacho business.",
            "What's better than MacOS? TacOS.",
            "What does a rude pepper do? It gets jalapeño face.",
            "Why'd the guacamole have an intevention? They were avocantrol.",
            "What did the freezing taco say? I'm a brrrrrito."
        ];

        setTimeout(function() {
            bot.reply(message, _.sample(jokes));
        }, 1000);
    };
};

module.exports = new Chatter();
