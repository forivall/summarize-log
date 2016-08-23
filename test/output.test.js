const stream = require('stream');

const tap = require('tap');

const summarize = require('../index');

// test that LogOutput produces a line of output for each chunk recieved

tap.plan(1);

var input = new stream.PassThrough({objectMode: true});
var lastOutput;

input
.pipe(new summarize.LogOutput())
.on('error', function (err) {
  tap.error(err, 'stream had an error');
})
.on('data', function (data, encoding) {
  if (Buffer.isBuffer(data)) data = data.toString(encoding);
  lastOutput = data;
})
.on('end', function () {
  tap.equal(lastOutput, 'time: 4, bytes: 8, lines: 10, rate: 2000 bytes/s\n', 'had output');
});

input.write({lines: 10, bytes: 8, time: 4});
process.nextTick(function () {
  input.end();
});
