var sub = require('./');
sub.init();
var unsubscribeFromThingStar = sub.subscribe('thing*', function(error, message, channel) {
    if(error) {
        console.error(error);
    }

    console.log(message + ' channelx: ' + channel);
});
var unsubscribeFromThing= sub.subscribe('thing', function(error, message, channel) {
    if(error) {
        console.error(error);
    }

    console.log(message + ' channely: ' + channel);
});

