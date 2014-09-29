/// <reference path="../../typings/all.d.ts"/>
"use strict";

import _ = require('lodash');
import scope = require('./angl-scope');
import scopeVariable = require('./scope-variable');
import strings = require('./strings');
import ModuleDescriptor = require('./module-descriptor');
var anglGlobalsNamespace = require('../../runtime/src/angl-globals-namespace');
// Trigger loading of all globals onto the globals namespace
require('../../runtime/src/angl-globals');
import options = require('./options');


export function createGlobalScope(opts: options.Options, extraGlobalIdentifiers:string[] = []): scope.AnglScope {
    var globalScope = new scope.AnglScope();

    var showMessageVariable = new scopeVariable.Variable('show_message');
    showMessageVariable.setProvidedByModule(new ModuleDescriptor('window', false, 'window'));
    showMessageVariable.generateGetter = function(jsGenerator, exprType, exprLocation) {
        jsGenerator.print('alert');
        return true;
    };
    globalScope.addVariable(showMessageVariable);
    
    // Grab the list of all global identifiers from the runtime
    var globalIdentifiers:Array<string> = _.keys(anglGlobalsNamespace);
    globalIdentifiers = _.difference(globalIdentifiers, ['true', 'false']);
    
    // Add any user-supplied global identifiers
    globalIdentifiers = globalIdentifiers.concat(extraGlobalIdentifiers);
    
    // Add variables for `true` and `false` to global scope.
    ['true', 'false'].forEach((name) => {
        var variable;
        if(opts.trueAndFalseAreNumberConstants) {
            variable = new scopeVariable.Variable(name, 'NONE', 'PROP_ACCESS');
            variable.setContainingObjectIdentifier(strings.ANGL_GLOBALS_IDENTIFIER);
        } else {
            variable = new scopeVariable.Variable(name, 'NONE', 'BARE');
        }
        globalScope.addVariable(variable);
    });
    
    // Add all global identifiers into global scope
    _.each(globalIdentifiers, (globalIdentifier) => {
        // TODO what values should I be adding?  Gotta invent an object/type/schema for values.
        var variable = new scopeVariable.Variable(globalIdentifier, 'PROP_ASSIGNMENT', 'PROP_ACCESS');
        variable.setContainingObjectIdentifier(strings.ANGL_GLOBALS_IDENTIFIER);
        globalScope.addVariable(variable);
    });

    return globalScope;
};

