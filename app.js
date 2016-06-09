if (!process.env.NODE_ENV) require('dotenv').config(); // development env vars

var express = require('express'),
    botkit = require('botkit'),
    schedule = require('node-schedule'),
    moment = require('moment-timezone'),
    chatter = require('./modules/chatter'),
    recommender = require('./modules/recommender'),
    reacter = require('./modules/reacter'),
    app = express();

// INITIALIZE BOT

var controller = botkit.slackbot({
    debug: false
});

var bot = controller.spawn({
    token: process.env.BOT_TOKEN
});

// DAILY POKE - runs M-F at 12 noon

var hourNormal = 12 - process.env.TIMEZONE_OFFSET,
    hourDST = hourNormal - 1;

var job = schedule.scheduleJob('0 0 ' + hourDST + ',' + hourNormal + ' * * 1-5', function() {

    if(moment().tz(process.env.TIMEZONE).hour() === 12) {

        bot.closeRTM();

        bot.startRTM(function(err) {
            if (err) throw err;
            chatter.poke(bot);
        });
    }
});

// EVENTS

var eventTypes = ['direct_message', 'direct_mention'];

controller.hears(['eat', 'food', 'hungry', 'hunger', 'lunch'], eventTypes, function(bot, message) {
    recommender.getRec(bot, message.channel);
});

controller.hears(['yelp', 'directions', 'map'], eventTypes, function(bot, message) {
    reacter.sendURL(bot, message);
});

controller.hears(['joke', 'funny', 'laugh'], eventTypes, function(bot, message) {
    chatter.tellJoke(bot, message);
});

controller.on('reaction_added', function(bot, message) {
    reacter.newReaction(bot, message);
});

module.exports = app;
