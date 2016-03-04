var requestify = require('requestify');

var Fieldbook = function() {

    var bookId = process.env.DB_ID,
        baseUrl = 'https://api.fieldbook.com/v1/' + bookId,
        options = {
            auth: {
                username: process.env.DB_USER,
                password: process.env.DB_PW
            }
        };

    this.getRestaurants = function(callback) {

        requestify.get(baseUrl + '/restaurants', options).then(function(res) {
            return callback(res.getBody());
        }, function(err) {
            console.log(err.getBody());
        });
    };

    this.updateRestaurant = function(id, attributes) {

        options.method = 'PATCH';
        options.body = attributes;

        requestify.request(baseUrl + '/restaurants/' + id, options).then(function(res) {
            // do nothing
        }, function(err) {
            console.log(err.getBody());
        });
    };
};

module.exports = new Fieldbook();
