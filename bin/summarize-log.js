#!/usr/bin/env node

'use strict';

const usage =
'tail -f <file> | summarize-log <options>\n' +
'          --help : show this message and exit\n' +
'  --start-time n : define a time (in milliseconds) to set when the timer \n' +
'                   should start (default: current time)\n' +
'       --bytes n : set the number of bytes already read\n' +
'        --line n : set the number of lines already read\n' +
'         --color : output the log in color (in terminals)\n';

const summarize = require('../index');

var parserOptions = {};
var outputOptions = {};

// NOTE: should use a cli parser module instead, but we're avoiding the extra'
// dependency and it's not that hard
var argv = process.argv.slice(2);
var i;
function useNextArg() {
  i++;
  if (i >= argv.length) {
    console.error(argv[i - 1] + ' requires a value');
    process.exit(1);
  }
}

for (i = 0; i < argv.length; i++) {
  switch (argv[i]) {
    case '--help':
      console.log(usage);
      process.exit(0);
      break;
    case '--start-time':
      useNextArg();
      parserOptions.startTime = Number(argv[i]);
      break;
    case '--bytes':
      useNextArg();
      parserOptions.bytes = Number(argv[i]);
      break;
    case '--lines':
      useNextArg();
      parserOptions.lines = Number(argv[i]);
      break;
    case '--color':
    case '--colour':
      outputOptions.color = true;
      break;
    case '--no-color':
    case '--no-colour':
      outputOptions.color = false;
      break;
    default:
      console.log('Unknown option: "' + argv[i] + '"');
      process.exit(1);
  }
}

process.stdin
.pipe(new summarize.LogParser(parserOptions))
.pipe(new summarize.LogOutput(outputOptions))
.pipe(process.stdout)
;
