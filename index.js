var redis = require('redis'),
    createSubscriber = require('redis-pattern-subscriber'),
    actualSubscriber = createSubscriber(),
    client;

function subscriber(pattern, subscribeCallback){
    if(!client){
        throw 'Not yet initialised';
    }

    actualSubscriber(client, pattern, subscribeCallback);
}

function init(port, host, logger) {
    if(client){
        throw 'Already initialised';
    }

    client = redis.createClient(port, host);

    client.on('error', function(error) {
        logger.error(error);
    });

    process.on('exit', function() {
        if (client) {
            client.end();
        }
    });
}

subscriber.init = init;

module.exports = subscriber;
