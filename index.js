var redis = require('redis'),
    createSubscriber = require('redis-pattern-subscriber'),
    actualSubscriber,
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

    actualSubscriber = createSubscriber(logger);

    client = redis.createClient(port, host);

    client.on('error', function(error) {
        if(error){
            return logger.error(error);
        }
    });

    process.on('exit', function() {
        if (client) {
            client.quit();
        }
    });
}

subscriber.init = init;

module.exports = subscriber;
