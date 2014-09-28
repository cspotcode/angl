/// <reference path="../../typings/all.d.ts" />
"use strict";

import _ = require('lodash');
import ModuleExportsType = require('./module-exports-type');
import scopeVariable = require('./scope-variable');
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
    /**
     * If this is a multi-export module, this is an array containing each variable it exports.
     */
    exports: Array<scopeVariable.AbstractVariable>;
    /**
     * If this is a single-export module, this is its only exported variable.
     */
    singleExport: scopeVariable.AbstractVariable;
    /**
     * Does this module export a single value or multiple values (as properties on an object)?
     */
    exportsType: ModuleExportsType;
    
    constructor(name: string, isRelative: boolean, preferredIdentifier?: string) {
        this.name = name;
        this.isRelative = isRelative;
        this.preferredIdentifier = preferredIdentifier || Ident.fromHyphenated(_.last(name.split('/'))).toCamelCase();
        this.exportsType = ModuleExportsType.UNKNOWN;
        this.exports = [];
        this.singleExport = null;
    }
}

export = ModuleDescriptor;
