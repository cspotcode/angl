The Angl Programming Language
===

Introduction
------------

angl is a programming language that compiles to JavaScript, which is designed to be largely [GML](http://en.wikipedia.org/wiki/Game_Maker_Language)-compatible, but adding several features.

angl's grammar was based on Game Maker 8.0 help files, whose definition of the grammar is much stricter than the Game Maker 8.0 GML parser actually is (for example, the parser does not require semicolons, happily disregards braces, allows both `=` and `:=` for assignment). However, it breaks compatibility and deviates significantly from GML's behaviour in certain places, as well as adding certain features

See the [wiki](https://github.com/gg2-angl/angl/wiki) for more information.

Name
----

angl is an acronym of __a__ngl's __n__ot __g__ame maker __l__anguage. It is, of course, a recursive acronym.


Usage
---

`node . examples/first.angl` outputs the AST generated from that example.

Components of this repo
---

To set up and compile the whole thing, just run `npm install`.

###`/parser` - Angl parser

####Compiling the parser

To generate the parser you'll need [Jison](http://zaach.github.com/jison/). (Best installed globally.)

To compile, run `build.js`.

###`/compiler`- Angl-to-JavaScript compiler

Compiles [Angl](https://github.com/TazeTSchnitzel/angl/) code into Javascript.

**See a live demo here:** http://cspotcode.github.com/angl-compiler/demo

It relies on the Angl parser to generate an AST, then compiles that AST into JavaScript.

####TODO List:

* Command-line interface for compiler
* Omit parentheses when they aren't necessary
* Add an exception-handling strategy that matches the way angl should behave at runtime (not sure exactly what it should do)

###`/runtime`- Angl JavaScript runtime

The Angl runtime is used at runtime by compiled Angl code.  The runtime is written in JavaScript, not Angl. 

###`/gs2angl` - GMK-Splitter to Angl converter

Takes the directory and XML structure produced by [Gmk-Splitter](https://github.com/Medo42/Gmk-Splitter) and produces a similar directory structure with angl equivalents.
