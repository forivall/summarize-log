const fs = require('fs');
const path = require('path');

const tap = require('tap');

const summarize = require('../index');

tap.plan(3);

var lastObject;
fs.createReadStream(path.join(__dirname, './fixtures/newlines.log'))
.pipe(new summarize.LogParser())
.on('error', function (err) {
  tap.error(err, 'stream had an error');
})
.on('data', function (data) {
  lastObject = data;
})
.on('end', function () {
  tap.equal(lastObject.lines, 2, 'number of lines');
  // $ wc -c < ./test/fixtures/newlines.log
  tap.equal(lastObject.bytes, 9, 'number of bytes');
  // TODO: mock Date (lolex?) to test the value
  tap.ok(lastObject.time, 'time is recorded');
});