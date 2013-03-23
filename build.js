#!/usr/bin/env node

var path = require('path');
var executive = require('executive');
require('shelljs/global');

// Let's get down to business

echo('Building angl parser...');

cd(__dirname);

// Create empty output directory
rm('-rf', 'out');
mkdir('out');

// Grab the path to Jison's command-line tool
var jisonBin = path.resolve(require.resolve('jison/package.json'), '..', require('jison/package.json').bin.jison);

// Build the parser
var command = buildCommandLine(process.argv[0], jisonBin, 'src/parser.jison', '-o', 'out/parser.js');
executive(command, function(err, out, code) {
    if(err) throw err;

    // Copy js source to output
    cp('src/*.js', 'out');

    echo('Done!');
});

////
// UTILITY FUNCTIONS
////

// Utility to combine arguments into a command line
function buildCommandLine(/* ... args */) {
    return [].slice.apply(arguments).map(function(v) {return v.replace(/ /g, '\\ ')}).join(' ');
};

