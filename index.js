'use strict';

const stream = require('stream');
const util = require('util');
const chalk = require('chalk');

/**
 * Takes Buffer / string input and outputs objects that report on how many
 * lines, how many bytes, and how long data has been streaming in
 *
 * * `options` <Object> Passed to Transform constructor. Also has the following
 *   fields:
 *   * `startTime` <Number> define a time (in milliseconds) to set when the
 *     timer should start (Default: `Date.now()`)
 *   * `bytes` <Number> set the number of bytes already read (Default: `0`)
 *   * `line` <Number> set the number of lines already read (Default: `0`)
 */
function LogParser(options) {
  if (options === undefined) options = {};
  options = Object.assign({readableObjectMode: true}, options);
  stream.Transform.call(this, options);

  this.startTime = options.startTime === undefined ? Date.now() : options.startTime;
  this.bytes = options.bytes === undefined ? 0 : options.bytes;
  this.lines = options.lines === undefined ? 0 : options.lines;
}
util.inherits(LogParser, stream.Transform);

module.exports.LogParser = LogParser;

/**
 * Standard Transform stream _transform
 * https://nodejs.org/api/stream.html#stream_transform_transform_chunk_encoding_callback
 */
LogParser.prototype._transform = function _transform(chunk, encoding, callback) {
  var lines = 0;
  var l = chunk.length;
  var i;
  var c;

  // Count newlines, taking into consideration Mac classic, Unix and Windows
  // newlines
  //
  // Doesn't handle other unicode newlines or newlines in other encodings

  // inline for speeed
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

/**
 * Takes objects output from the above LogParser and outputs single lines of
 * output for output to cli or a separate log file
 *
 * * `options` <Object> Passed to Transform constructor. Also has the following
 *   field:
 *   * `color` <Boolean> Color the output with `chalk`
 */
function LogOutput(options) {
  if (options === undefined) options = {};
  options = Object.assign({writableObjectMode: true}, options);
  stream.Transform.call(this, options);
  this.chalk = new chalk.constructor({enabled: Boolean(options.color)});
}
util.inherits(LogOutput, stream.Transform);

module.exports.LogOutput = LogOutput;

/**
 * Standard Transform stream _transform
 * https://nodejs.org/api/stream.html#stream_transform_transform_chunk_encoding_callback
 */
LogOutput.prototype._transform = function _transform(chunk, encoding, callback) {
  callback(null,
    this.chalk.cyan(this.chalk.bold('time: ') + String(chunk.time)) + ', ' +
    this.chalk.magenta(this.chalk.bold('bytes: ') + String(chunk.bytes)) + ', ' +
    this.chalk.blue(this.chalk.bold('lines: ') + String(chunk.lines)) + ', ' +
    this.chalk.yellow(this.chalk.bold('rate: ') + (chunk.bytes / chunk.time * 1000).toPrecision(4) + ' bytes/s') +
    '\n'
  );
};
