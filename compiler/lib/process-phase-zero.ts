/// <reference path="../../typings/all.d.ts"/>
"use strict";

import types = require('./ast-types');
var globalScope = require('./global-scope');
import AnglScope = require('./angl-scope');
import scopeVariable = require('./scope-variable');
import strings = require('./strings');

// Wrap the entire AST in a "file" node
// TODO fix typing of ast argument
export var transform = (ast:any):types.AstNode => {
    var anglScope = new AnglScope.AnglScope();
    var thisVariable = new scopeVariable.Variable('self', 'ARGUMENT');
    thisVariable.setJsIdentifier('this');
    var otherVariable = new scopeVariable.Variable('other', 'PROP_ASSIGNMENT', 'PROP_ACCESS');
    otherVariable.setContainingObjectIdentifier(strings.ANGL_RUNTIME_IDENTIFIER);
    anglScope.addVariable(thisVariable);
    anglScope.addVariable(otherVariable);
    var globalAnglScope = ast.globalAnglScope || globalScope.createGlobalScope();
    anglScope.setParentScope(globalAnglScope);
    // Verify that the root node is of type "statements"
    if(ast.type !== 'statements') {
        throw new Error('Unexpected root node from Angl parser. Expected type "statements", got "' + ast.type + '".');
    }
    var fileNode:types.FileNode = {
        type: "file",
        stmts: ast.list,
        globalAnglScope: globalAnglScope,
        anglScope: anglScope
    };
    return fileNode;
};
