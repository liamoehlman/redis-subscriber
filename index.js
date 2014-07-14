var redis = require('redis'),
    loggerObject = console,
    client;

function init(port, host, logger) {
    if (logger) {
        loggerObject = logger;
    }
    client = redis.createClient(port, host);
}

function unsubscribe(channel, callback) {
    if (!callback) {
        loggerObject.warn('no callback provided to unsubscribe on channel: ' + channel);
        callback = function() {};
    }
    if (!client) {
        loggerObject.warn('init must be called first');
        return callback(new Error('init must be called first'));
    }

    client.punsubscribe(channel, function(error){
        if (error) {
            loggerObject.error(error);
            return callback(error);
        }

        loggerObject.info('unsubscribed from ' + channel);

        return callback(null, 'unsubscribed from ' + channel);
    });
}

function subscribe(pattern, callback) {
    if (!callback) {
        loggerObject.warn('no callback provided to subscribe on channel: ' + pattern);
        callback = function() {};
    }
    if (!client) {
        loggerObject.warn('init must be called first');
        return callback(new Error('init must be called first'));
    }

    function callbackInstance(matchedPattern, channel, message) {
        // console.log('callbackInstance');
        // console.log(arguments);
        // console.log('matchedPattern === pattern: ' + (matchedPattern === pattern));
        if(matchedPattern === pattern) {
            return callback(null, message, channel);
        }
    }

    client.psubscribe(pattern, function(error) {
        if (error) {
            loggerObject.error(error);
            return callback(error);
        }

        client.on('pmessage', callbackInstance);
    });

    return function unsubscribeFromPattern(callback) {
        client.removeListener('pmessage', callbackInstance);
        unsubscribe(pattern, callback);
    };
}

process.on('exit', function() {
    if (client) {
        client.end();
    }
});

module.exports = {
    init: init,
    subscribe: subscribe
};
