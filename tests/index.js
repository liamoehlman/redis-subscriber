var test = require('grape'),
    mockery = require('mockery'),
    emitter = require('events').EventEmitter,
    pathToObjectUnderTest = '../index.js';

mockery.registerAllowables([pathToObjectUnderTest, 'loggerObject']);

function resetMocks() {
    mockery.registerMock('redis', {});
}

function getCleanTestObject() {
    delete require.cache[require.resolve(pathToObjectUnderTest)];
    mockery.enable({ useCleanCache: true, warnOnReplace: false });
    var objectUnderTest = require(pathToObjectUnderTest);
    mockery.disable();
    resetMocks();
    return objectUnderTest;
}

resetMocks();

test('redis-sub Exists', function (t) {
    t.plan(2);
    var sub = getCleanTestObject();
    t.ok(sub, 'redis-sub Exists');
    t.equal(typeof sub, 'object', 'redis-sub is an object');
});

test('redis-sub.init creates client with correct host and port', function(t) {
    t.plan(2);
    var testHost = '10.foo.bar.1',
        testPort = 9001;

    mockery.registerMock('redis', {
        createClient: function(port, host) {
            t.equal(testPort, port, 'called with correct port');
            t.equal(testHost, host, 'called with correct host');
        }
    });

    var sub = getCleanTestObject();

    sub.init(testPort, testHost);
});

test('redis-sub.subscribe calls psubscribe with correct pattern', function(t) {
    t.plan(1);
    var testPattern = 'atestp*ttern';

    mockery.registerMock('redis', {
        createClient: function(){ return {
            psubscribe: function(pattern) {
                t.equal(pattern, testPattern, 'called with correct pattern');
            },
            end: function(){}
        };
    }});

    var sub = getCleanTestObject();

    sub.init();
    sub.subscribe(testPattern, function(){});
});

test('redis-sub.subscribe returns callback error if not initialised', function(t) {
    t.plan(2);
    var testPattern = 'atestp*ttern',
        sub = getCleanTestObject();

    sub.subscribe(testPattern, function(error) {
        t.ok(error, 'error received when not initialised');
        t.deepEqual('init must be called first', error.message, 'correct error received');
    });
});

test('handles errors correctly', function(t) {
    t.plan(1);
    var testError = 'splat!';

    mockery.registerMock('redis', {
        createClient: function(){ return {
            psubscribe: function(pattern, callback) {
                callback(testError);
            },
            end: function(){}
        };
    }});

    var sub = getCleanTestObject();

    sub.init();
    sub.subscribe('null', function(error) {
        t.equal(error, testError, 'got correct error');
    });
});

test('unsubscribe cleans up correctly', function(t) {
    t.plan(2);
    var testCallback1 = function(error, message, channel) {
          console.log('TEST CALLBACK 1');
          console.log(arguments);
            // t.equal(message, testMessage, 'got correct message');
            // t.equal(channel, testChannel, 'got correct channel');
        },
        testPattern = 'aPatter*',
        testChannel = 'aPattern',
        testMessage = 'The Message!';

    mockery.registerMock('redis', {
        createClient: function(){ return {
            psubscribe: function(pattern) {
                // emitter.emit('pmessage', testPattern, testChannel, testMessage);
                // this.on('pmessage', testPattern, testChannel, testMessage);
            },
            // on: function(eventType) {
            //     console.log('ON: ');
            //     console.log(arguments);
            //     emitter.on('pmessage', this);
            //     t.equal(eventType, 'pmessage', 'subscribed to correct message type');
            //     // setTimeout(testCallback1(testPattern, 'aPattern', testMessage), 1000);
            // },
            removeListener: function(eventType, callback) {
                callback();
            },
            punsubscribe: function(pattern, callback) {
                t.equal(pattern, testPattern, 'unsubscribed from correct pattern');
                callback();
            },
            end: function(){}
        };
    }});

    var sub = getCleanTestObject();

    sub.init();

    sub.subscribe(testPattern, testCallback1)(function(){});

});

// test('unsubscribe cleans up correctly', function(t) {
//     t.plan(1);
//     var testCallback1 = function() {
//             return 'blah';
//         },
//         testPattern = 'aPattern',
//         testPattern2 = 'anotherPattern';

//     mockery.registerMock('redis', {
//         createClient: function(){ return {
//             psubscribe: function(pattern, callback) {
//                 emitter.emit('pmessage', function(testPattern, channel, message){});
//             },
//             on: function(eventType, callback) {
//                 callback();
//             },
//             removeListener: function(eventType, callback) {
//                 callback();
//             },
//             punsubscribe: function(pattern, callback) {
//                 t.equal(pattern, testPattern, 'unsubscribed from correct pattern');
//                 callback();
//             },
//             end: function(){}
//         };
//     }});

//     var sub = getCleanTestObject();

//     sub.init();

//     sub.subscribe(testPattern, testCallback1)(function(){});

// });