# redis-subscriber

## Example

var host = '127.0.0.1',
    port = '6379',
    subscribe = require('redis-subscriber')(port, host);

subscribe('thing*', function(error, emitter){
    var count = 0;

    if(error) {
        return console.log(error);
    }

    emitter.on('message', function(message, channel) {

        console.log('MESSAGE: '+ message + ' CHANNEL: ' + channel);

        count++;
        if(count >= 5) {
            emitter.unsubscribe();
        }
    });
});
