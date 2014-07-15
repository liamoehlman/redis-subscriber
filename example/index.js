var host = '127.0.0.1',
    port = '6379',
    subscribe = require('../')(port, host);

// VARIABLE

var subscription = subscribe('thing', function(error){
    if(error) {
        return console.log(error);
    }
});

subscription.on('message', function(message, channel) {
    console.log('MESSAGE: '+ message + ' CHANNEL X: ' + channel);

    if(message === 'destroy the thing'){
        this.unsubscribe();
    }
});

// CHAINING

subscribe('thing*', function(error){
    if(error) {
        return console.log(error);
    }
}).on('message', function(message, channel) {
    console.log('MESSAGE: '+ message + ' CHANNEL Y: ' + channel);

    if(message === 'destroy'){
        subscription.unsubscribe();
        this.unsubscribe();
    }
});

// FUNCTION SCOPE

subscribe('thingy', function(error, emitter){
    if(error) {
        return console.log(error);
    }

    emitter.on('message', function(message, channel) {
        console.log('MESSAGE: '+ message + ' CHANNEL Z: ' + channel);
        if(message === 'destroy'){
            emitter.unsubscribe(function(error, confirmation) {
                console.log(confirmation);
            });
        }
    });
});
