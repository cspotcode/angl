/// <reference path="../../typings/all.d.ts"/>
"use strict";

import fs = require('fs');
import path = require('path');
import _ = require('lodash');

import compiler = require('./compiler');
import options = require('./options');

var inputDirectory = path.resolve(__dirname, '../../examples/project/angl');
var outputDirectory = path.resolve(__dirname, '../../examples/project/ts');

var compilerOptions = new options.Options();
compilerOptions.trackReferencedGlobalVariables = true;

var result = compiler.compileDirectory({
    src: inputDirectory,
    dest: outputDirectory,
    //globalVariables: globals,
    options: compilerOptions
});

var referencedGlobalIdentifiers = result.referencedGlobalVariables.map((variable) => variable.getIdentifier());
referencedGlobalIdentifiers.sort();
fs.writeFileSync(path.join(outputDirectory, 'referenced-global-variables.json'), JSON.stringify(referencedGlobalIdentifiers, null, '    '));
