Angl-to-Javascript compiler
===

Compiles [Angl](https://github.com/cspotcode/angl/) code into Javascript or TypeScript.

**See a live demo here:** http://cspotcode.github.io/angl/demo

This project uses a parser originally created by TazeTSchnitzel, since modified for this project, to generate an AST.
Then we compile that AST into Javascript or TypeScript.

Building:
---

To build the parser, compiler, and browser-based demo:
```
> grunt build
```

Documentation:
---

To generate API documentation into `./docs`:
```
> grunt docs
```

Tests:
---

To compile and run the tests:
```
> grunt test
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
