const stream = require('stream');

const tap = require('tap');

const summarize = require('../index');

// test the string path of LogParser#_transform, which is only hit when
// `decodeStrings: false` and strings are passed in

tap.plan(3);

var input = new stream.PassThrough({defaultEncoding: 'utf8', encoding: 'utf8', decodeStrings: false});
var lastObject;

input.pipe(new summarize.LogParser({defaultEncoding: 'utf8', decodeStrings: false}))
.on('error', function (err) {
  tap.error(err, 'stream had an error');
})
.on('data', function (data) {
  lastObject = data;
})
.on('end', function () {
  tap.equal(lastObject.lines, 3, 'number of lines');
  // $ wc -c < ./test/fixtures/ipsum.log
  tap.equal(lastObject.bytes, 43, 'number of bytes');
  // TODO: mock Date (lolex?) to test the value
  tap.ok(typeof lastObject.time === 'number', 'time is recorded');
});

input.write('this is some text\nwinnewline:\r\nmacnewline:\r');
setTimeout(function () {
  input.end();
}, 10);
