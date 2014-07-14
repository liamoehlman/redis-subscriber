var redis = require('redis'),
    createSubscriber = require('../redis-pattern-subscriber');

function init(port, host, logger) {
    var client = redis.createClient(port, host);

    var subscriber = createSubscriber(logger);

    process.on('exit', function() {
        if (client) {
            client.end();
        }
    });

    return subscriber.bind(null, client);
}

module.exports = init;
