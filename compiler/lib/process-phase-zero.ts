/// <reference path="../../typings/all.d.ts"/>
"use strict";

import types = require('./ast-types');
import globalScope = require('./global-scope');
import AnglScope = require('./angl-scope');
import scopeVariable = require('./scope-variable');
import strings = require('./strings');
import ModuleDescriptor = require('./module-descriptor');
import options = require('./options');

// Wrap the entire AST in a "file" node
// TODO fix typing of ast argument
export var transform = (ast:types.StatementsNode, opts: options.Options):types.AstNode => {
    // Sanity-check that we were, in fact, passed a StatementsNode
    if(ast.type !== 'statements')
        throw new Error('Transformation phase expected a statements node, got a ' + ast.type + ' node instead.');
    
    var anglScope = new AnglScope.AnglScope();
    var thisVariable = new scopeVariable.Variable('self', 'ARGUMENT');
    thisVariable.setJsIdentifier('this');
    var otherVariable = new scopeVariable.Variable('other', 'PROP_ASSIGNMENT', 'PROP_ACCESS');
    otherVariable.setContainingObjectIdentifier(strings.ANGL_RUNTIME_IDENTIFIER);
    var requireVariable = new scopeVariable.Variable(null, 'ARGUMENT', 'BARE');
    requireVariable.setJsIdentifier('require');
    var exportsVariable = new scopeVariable.Variable(null, 'ARGUMENT', 'BARE');
    exportsVariable.setJsIdentifier('exports');
    var moduleVariable = new scopeVariable.Variable(null, 'ARGUMENT', 'BARE');
    moduleVariable.setJsIdentifier('module');
    anglScope.addVariable(thisVariable);
    anglScope.addVariable(otherVariable);
    anglScope.addVariable(requireVariable);
    anglScope.addVariable(exportsVariable);
    anglScope.addVariable(moduleVariable);
    var globalAnglScope = ast.globalAnglScope || globalScope.createGlobalScope(opts);
    anglScope.setParentScope(globalAnglScope);
    // Verify that the root node is of type "statements"
    if(ast.type !== 'statements') {
        throw new Error('Unexpected root node from Angl parser. Expected type "statements", got "' + ast.type + '".');
    }
    var fileNode = new types.FileNode(ast.list, 'main');
    
    fileNode.anglScope = anglScope;
    fileNode.globalAnglScope = globalAnglScope;
    
    return fileNode;
};
