'use strict';

const stream = require('stream');
const util = require('util');

module.exports.LogParser = LogParser;
function LogParser(options) {
  if (options === undefined) options = {};
  options.readableObjectMode = true;
  stream.Transform.call(this, options);

  this.startTime = options.startTime === undefined ? Date.now() : options.startTime;
  this.bytes = options.bytes === undefined ? 0 : options.bytes;
  this.lines = options.lines === undefined ? 0 : options.lines;
}

util.inherits(LogParser, stream.Transform);

// NOTE: we don't handle other, fancy unicode newlines, just \n, \r\n, \r

LogParser.prototype._transform = function _transform(chunk, encoding, callback) {
  var lines = 0;
  var l = chunk.length;
  var i;
  var c;

  // inline for speeed
  // counts newlines
  if (Buffer.isBuffer(chunk)) {
    for (i = 0; i < l; i++) {
      c = chunk[i];
      if (c === 13) {
        lines++;
        if (chunk[i + 1] === 10) i++;
      } else if (c === 10) {
        lines++;
      }
    }
  } else {
    for (i = 0; i < l; i++) {
      c = chunk.charCodeAt(i);
      if (c === 13) {
        lines++;
        if (chunk.charCodeAt(i + 1) === 10) i++;
      } else if (c === 10) {
        lines++;
      }
    }
  }
  this.lines += lines;
  this.bytes += l;

  callback(null, {
    time: Date.now() - this.startTime,
    bytes: this.bytes,
    lines: this.lines
  });
};

module.exports.LogOutput = LogOutput;
function LogOutput(options) {
  if (options === undefined) options = {};
  options.writableObjectMode = true;
  stream.Transform.call(this, options);
  // TODO: add a color option, use chalk
}

util.inherits(LogOutput, stream.Transform);

LogOutput.prototype._transform = function _transform(chunk, encoding, callback) {
  callback(null,
    'time: ' + String(chunk.time) +
    ', bytes: ' + String(chunk.bytes) +
    ', lines: ' + String(chunk.lines) + '\n'
  );
}
