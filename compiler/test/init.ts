/// <reference path="../../typings/all.d.ts" />
/// <reference path="../../typings/test.d.ts" />
"use strict";

// Make stack traces support sourcemaps, so that line numbers and filenames are meaningful
require('source-map-support').install();

// Install the sinon-chai plugin
import chai = require('chai');
import sinonChai = require('sinon-chai');
chai.use(sinonChai);
