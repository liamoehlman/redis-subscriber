module.exports = function(logger) {
    if (!logger) {
        logger = console;
    }

    function unsubscribe(client, pattern, callback) {
        client.punsubscribe(pattern, function(error){
            if (error) {
                logger.error(error);
                return callback(error);
            }

            logger.info('unsubscribed from ' + pattern);
            return callback(null, 'unsubscribed from ' + pattern);
        });
    }

    return function(client, pattern, callback) {
         if (!callback) {
            throw 'no callback provided to subscribe on channel: ' + pattern;
        }
        if (!client) {
            logger.warn('init must be called first');
            return callback(new Error('init must be called first'));
        }

        function callbackInstance(matchedPattern, channel, message) {
            if(matchedPattern === pattern) {
                return callback(null, message, channel);
            }
        }

        client.psubscribe(pattern, function(error) {
            if (error) {
                logger.error(error);
                return callback(error);
            }

            client.on('pmessage', callbackInstance);
        });

        return function unsubscribeFromPattern(callback) {
            client.removeListener('pmessage', callbackInstance);
            unsubscribe(client, pattern, callback);
        };
    };
};