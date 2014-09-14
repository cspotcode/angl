Angl-to-Javascript compiler
===

Compiles [Angl](https://github.com/TazeTSchnitzel/angl/) code into Javascript.

**See a live demo here:** http://cspotcode.github.com/angl-compiler/demo

This project relies on TazeTSchnitzel's Angl parser to generate an AST, then compiles that AST into Javascript.

Tests:
---

To compile and run the tests:
```
> cd compiler
> node build-tests.js
> ..\node_modules\.bin\mocha
```

The tests are located in `compiler/test`.  Each test filename must end in `.spec.ts`.  When practical, it should match the
filename of the code being tested.  For example, the tests for `lib/bar/foo.ts` should be in `test/bar/foo.spec.ts`.

The tests are written in TypeScript using [mocha](http://visionmedia.github.io/mocha/)'s BDD-style API and the
[chai](http://chaijs.com/) assertion library's expect-style API.

`test/template.spec.ts` can be copied to create new test files.  It references the right TypeScript definitions and
loads the necessary assertion library.

TODO List:
---
* Command-line interface
* Omit parentheses when they aren't necessary
* Add an exception-handling strategy that matches the way angl should behave at runtime (not sure exactly what it should do)
