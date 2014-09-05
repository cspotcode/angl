/// <reference path="../../typings/all.d.ts" />
"use strict";

// See angl-parser.ts for the reason this is necessary.

import types = require('./ast-types');

interface AnglParser {
    parse(input:string): types.AstNode;
    printAST(input:string): void;
}

export = AnglParser;
