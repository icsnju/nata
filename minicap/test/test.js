var assert = require('assert');
var monkey = require('adbkit-monkey');

var client = monkey.connect({
    port: 1080
});

client.press(3 /* KEYCODE_HOME */ , function(err) {
    assert.ifError(err);
    console.log('Pressed home button');
    client.end();
});