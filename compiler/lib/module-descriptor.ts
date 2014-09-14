/// <reference path="../../typings/all.d.ts" />
"use strict";

import _ = require('lodash');
import identifierManipulations = require('./identifier-manipulations');
var Ident = identifierManipulations.Identifier;

class ModuleDescriptor {
    /**
     * Name of this module.  Passed as the argument to `require()` calls, with modification if
     * this is a relative module.
     */
    name: string;
    /**
     * Should this module be loaded with a relative path?
     * Generally this is true for modules that are part of your project and not true for
     * third-party dependencies.
     */
    isRelative: boolean;
    /**
     * Prefers this local variable name when require'd into another
     * module.
     * for example, a module could be named 'math-routines' but it's preferred
     * identifier would be something like 'math'.
     * `import math = require('math-routines')`
     */
    preferredIdentifier: string;
    
    constructor(name: string, isRelative: boolean, preferredIdentifier?: string) {
        this.name = name;
        this.isRelative = isRelative;
        this.preferredIdentifier = preferredIdentifier || Ident.fromHyphenated(_.last(name.split('/'))).toCamelCase();
    }
}

export = ModuleDescriptor;
