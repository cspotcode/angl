#!/usr/bin/env node
"use strict";

var fs = require('fs');
var path = require('path');
var glob = require('glob');
var _ = require('lodash');
var child_process = require('child_process');
require('shelljs/global');

// Manually `cd` into the same directory as this script
pushd(__dirname);

// Compile TypeScript
var tsFiles = glob.sync('test/**/*.ts');
var cmd = require.resolve('typescript/' + require('typescript/package.json').bin.tsc);
child_process.spawn(process.argv[0], [cmd, '--sourcemap', '--module', 'commonjs', '--outDir', '../compiler-build'].concat(tsFiles), {stdio: ['ignore', 1, 2]}).on('close', function(code) {
    if(code) throw code;
});
