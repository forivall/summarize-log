const fs = require('fs');
const path = require('path');

const tap = require('tap');

const summarize = require('../index');

// test the basic "read a long input file" test case

tap.plan(3);

var lastObject;
fs.createReadStream(path.join(__dirname, './fixtures/ipsum.log'))
.pipe(new summarize.LogParser())
.on('error', function (err) {
  tap.error(err, 'stream had an error');
})
.on('data', function (data) {
  lastObject = data;
})
.on('end', function () {
  // $ wc -l < ./test/fixtures/ipsum.log
  tap.equal(lastObject.lines, 49, 'number of lines');
  // $ wc -c < ./test/fixtures/ipsum.log
  tap.equal(lastObject.bytes, 3253, 'number of bytes');
  // TODO: mock Date (lolex?) to test the value
  tap.ok(lastObject.time, 'time is recorded');
});
