README
======

Introduction
------------

angl is a programming language that compiles to JavaScript, which is designed to be largely [GML](http://en.wikipedia.org/wiki/Game_Maker_Language)-compatible, but adding several features.

Language notes
-------------

angl's grammar is based on Game Maker 8.0 help files, whose definition of the grammar is much stricter than the Game Maker 8.0 GML parser actually is (for example, the parser does not require semicolons, happily disregards braces, allows both `=` and `:=` for assignment).

However, it breaks compatibility in a few places.

For a full overview, see *Language overview* below.

Name
----

angl is an acronym of __a__ngl's __n__ot __g__ame maker __l__anguage. It is, of course, a recursive acronym.

Compiling
---------

To generate the parser you'll need [Jison](http://zaach.github.com/jison/). 

To install all dependencies just run `npm install` in the source tree root.

To compile, run `build.sh`. If you don't have a shell (git bash on windows works fine), you can also manually make sure an empty `out` directory exists, run `jison src/parser.jison --output-file=out/parser.js` and then copy the other .js files to that directory.

Usage
-----

`node angl.js ../examples/first.gml` outputs the AST generated from that example.

Language overview
-----------------

See the wiki.
