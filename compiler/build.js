#!/usr/bin/env node
"use strict";

var fs = require('fs');
var path = require('path');
var glob = require('glob');
var jade = require('jade');
var stylus = require('stylus');
var _ = require('lodash');
var child_process = require('child_process');
require('shelljs/global');

var input, output;

// Manually `cd` into the same directory as this script
pushd(__dirname);

// create output directories
mkdir('-p', 'out/demo/vendor');

// render demo html
input = cat('demo/index.jade');
output = jade.compile(input)();
output.to('out/demo/index.html');

// render demo css
input = cat('demo/style.styl');
stylus(input).render(function(err, output) {
    if(err) throw err;
    output.to('out/demo/style.css');

    // Compile TypeScript
    var tsFiles = glob.sync('lib/**/*.ts');
    var cmd = require.resolve('typescript/' + require('typescript/package.json').bin.tsc);
    child_process.spawn(process.argv[0], [cmd, '--sourcemap', '--module', 'commonjs', '--outDir', '../compiler-build/lib'].concat(tsFiles), {stdio: ['ignore', 1, 2]}).on('close', function(code) {
        if(code) throw code;
      
        // Copy all plain .js files from `lib`
        glob.sync('**/*.js', {cwd: 'lib'}).forEach(function(file) {
            var dest = path.join('../compiler-build/lib', file);
            mkdir('-p', path.dirname(dest));
            fs.writeFileSync(dest, fs.readFileSync(path.join('lib', file)));
        });
        // Copy everything from `resources`
        glob.sync('**/*', {cwd: 'resource'}).forEach(function(file) {
            var dest = path.join('../compiler-build/resource', file);
            mkdir('-p', path.dirname(dest));
            fs.writeFileSync(dest, fs.readFileSync(path.join('resource', file)));
        });

        // Build a minified JS bundle
        require('./run-requirejs-optimizer');
    });
});
