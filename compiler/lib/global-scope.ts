/// <reference path="../../typings/all.d.ts"/>
"use strict";

import _ = require('lodash');

import scope = require('./angl-scope');
import scopeVariable = require('./scope-variable');
import variableTypes = require('./variable-types');
import strings = require('./strings');
import ModuleDescriptor = require('./module-descriptor');
import options = require('./options');
import ModuleExportsType = require('./module-exports-type');
var allGmlGlobalIdentifiers = <Array<string>>require('../resource/globals');


export function createGlobalScope(opts: options.Options, extraGlobalIdentifiers:string[] = [], extraGlobalVariables: Array<scopeVariable.AbstractVariable> = []): scope.AnglScope {
    var globalScope = new scope.AnglScope();
    
    // Add variables for `true` and `false` to global scope.
    ['true', 'false'].forEach((name) => {
        var variable;
        if(opts.trueAndFalseAreNumberConstants) {
            variable = new scopeVariable.Variable(name, scopeVariable.AllocationType.NONE, scopeVariable.AccessType.PROP_ACCESS);
            variable.setContainingObjectIdentifier(strings.ANGL_GLOBALS_IDENTIFIER);
        } else {
            variable = new scopeVariable.Variable(name, scopeVariable.AllocationType.NONE, scopeVariable.AccessType.BARE);
        }
        globalScope.addVariable(variable);
    });
    
    // Add variable for AnglRoom to global scope.
    var anglRoomVariable = new scopeVariable.Variable('AnglRoom', scopeVariable.AllocationType.IMPORT, scopeVariable.AccessType.BARE);
    anglRoomVariable.setDataType(new variableTypes.ClassType());
    var anglRoomModule = new ModuleDescriptor('angl/room', false, 'AnglRoom');
    anglRoomModule.exportsType = ModuleExportsType.SINGLE;
    anglRoomModule.singleExport = anglRoomVariable;
    anglRoomVariable.setProvidedByModule(anglRoomModule);
    globalScope.addVariable(anglRoomVariable);

    // Add variable for AnglObject to global scope.
    var anglObjectVariable = new scopeVariable.Variable(strings.SUPER_OBJECT_NAME, scopeVariable.AllocationType.NONE, scopeVariable.AccessType.PROP_ACCESS);
    anglObjectVariable.setJsIdentifier('AnglObject');
    anglObjectVariable.setDataType(new variableTypes.ClassType());
    var anglObjectModule = new ModuleDescriptor('angl/object', false, 'AnglObject');
    anglObjectModule.exportsType = ModuleExportsType.SINGLE;
    anglObjectModule.singleExport = anglObjectVariable;
    anglObjectVariable.setProvidedByModule(anglObjectModule);
    globalScope.addVariable(anglObjectVariable);

    // Add all extra global variables into global scope
    _.each(extraGlobalVariables, (globalVariable) => {
        globalScope.addVariable(globalVariable);
    });
    
    function addIdentifierToGlobalScope(globalIdentifier) {
        // TODO what values should I be adding?  Gotta invent an object/type/schema for values.
        var variable = new scopeVariable.Variable(globalIdentifier, scopeVariable.AllocationType.PROP_ASSIGNMENT, scopeVariable.AccessType.PROP_ACCESS);
        variable.setContainingObjectIdentifier(strings.ANGL_GLOBALS_IDENTIFIER);
        globalScope.addVariable(variable);
    }
    
    // Add any user-supplied global identifiers
    _.each(extraGlobalIdentifiers, addIdentifierToGlobalScope);
    
    // Add our built-in list of GM's global identifiers
    // Omit identifiers that are already in global scope
    var globalIdentifiers = <Array<string>>_.filter(allGmlGlobalIdentifiers, (ident) => !globalScope.hasIdentifier(ident));

    _.each(globalIdentifiers, addIdentifierToGlobalScope);

    return globalScope;
}

