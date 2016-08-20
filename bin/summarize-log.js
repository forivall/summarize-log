#!/usr/bin/env node

'use strict';

const summarize = require('../index');

process.stdin
.pipe(new summarize.LogParser())
.pipe(new summarize.LogOutput())
.pipe(process.stdout)
;
