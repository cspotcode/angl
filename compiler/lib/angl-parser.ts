/// <reference path="../../typings/all.d.ts" />
"use strict";

// A simple redirect to the angl parser, applying
// TypeScript type information.
// This is necessary because .d.ts files cannot declare modules
// with relative paths.

import AnglParser = require('./angl-parser-interface');

var anglParser = <AnglParser>require('../../parser/out/angl');

export = anglParser;
