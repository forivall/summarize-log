const childProc = require('child_process');
const fs = require('fs');
const path = require('path');

const tap = require('tap');

const summarize = require('../index');

tap.plan(2);

const proc = childProc.execFile(process.execPath, [
  path.join(__dirname, '../bin/summarize-log.js'),
  '--bytes', '12',
  '--lines', '1',
  '--no-color'
], function (err, stdout) {
  tap.error(err, 'child process had an error');
  tap.match(stdout, /^time: \d+, bytes: 16, lines: 2, rate: \d+(\.\d+)? bytes\/s\n$/);
});

fs.createReadStream(path.join(__dirname, './fixtures/foo.log'))
.pipe(proc.stdin);
