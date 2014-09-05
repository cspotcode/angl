"use strict";

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
//    var tsFiles = [
//        'lib/angl-scope.ts',
//        'lib/ast-node-children.ts',
//        'lib/ast-types.ts',
//        'lib/ast-utils.ts',
//        'lib/compiler.ts',
//        'lib/find-globals.ts',
//        'lib/global-scope.ts',
//        'lib/process-phase-assign-js-identifiers.ts',
//        'lib/process-phase-mark-method-calls.ts',
//        'lib/process-phase-one.ts',
//        'lib/process-phase-resolve-identifiers-to-variables.ts',
//        'lib/process-phase-zero.ts',
//        'lib/run-all-transformations.ts',
//        'lib/scope-variable.ts',
//        'lib/strings.ts',
//        'lib/tree-walker.ts'
//    ];
    var tsFiles = glob.sync('lib/**/*.ts');
    var cmd = require.resolve('typescript/' + require('typescript/package.json').bin.tsc);
    child_process.spawn(process.argv[0], [cmd, '--sourcemap', '--module', 'commonjs'].concat(tsFiles), {stdio: ['ignore', 1, 2]}).on('close', function(code) {
        if(code) throw code;

        // Build a minified JS bundle
        require('./run-requirejs-optimizer');
    });
});
