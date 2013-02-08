#!/usr/bin/sh
rm -rf out
mkdir out
jison src/parser.jison --output-file=out/parser.js
cp src/*.js out
