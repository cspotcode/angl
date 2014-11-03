/// <reference path="../../typings/all.d.ts"/>
"use strict";

// AST transformation phase two

import treeWalker = require('./tree-walker');
import scope = require('./angl-scope');
import astTypes = require('./ast-types');
import astUtils = require('./ast-utils');
import options = require('./options');
import scopeVariable = require('./scope-variable');
import variableTypes = require('./variable-types');
import identifierManipulations = require('./identifier-manipulations');
var Ident = identifierManipulations.Identifier;
var walk = treeWalker.walk;

// Create scopes for all nodes
export var transform = (ast:astTypes.AstNode, options: options.Options) => {
    var fileNode: astTypes.FileNode;
    walk(ast, (node, parent, locationInParent:string) => {
        // Cache the file node that we are currently within.  This is useful later when adding proxy
        // variables to the file's scope.
        if(node.type === 'file') {
            fileNode = node;
        }
        if(node.type === 'identifier') {
            // If this identifier node is actually a property name for property access (e.g. the `bar` in `foo.bar`)
            // then it does *not* resolve to a variable in scope.
            if(locationInParent === 'expr2' && parent.type === 'binop' && (parent.op === '.' || parent.op === '->')) {
                return;
            }
            // Some identifiers have already been resolved to a variable, possibly because they
            // were generated by AST transformations.
            if(node.variable) {
                return;
            }
            var anglScope = astUtils.getAnglScope(node);
            var variable = anglScope.getVariableByIdentifierInChain(node.name);
            // If there's no variable by that name in scope, then we're dealing with a property of `this`
            // (e.g. `this.bar`)
            if(!variable) {
                // Replace this identifier node with a `this.bar` node
                return {
                    type: 'binop',
                    op: '.',
                    expr1: {
                        type: 'identifier',
                        name: 'self'
                    },
                    expr2: astUtils.cleanNode(node)
                };
            }
            // If this is a module-provided variable, create a new proxy variable in file scope and resolve the
            // identifier to that proxy variable.
            if(variable.getProvidedByModule()) {
                variable = fileNode.getLocalProxyForModuleVariable(variable, true);
            }
            node.variable = variable;
            // Tell the scope that this variable is actually being used in the code.
            astUtils.getAnglScope(node).setVariableInChainIsUsed(variable);
            // If this variable is from a parent scope, and it could theoretically be shadowed, then we must tell this
            // scope and parent scopes to avoid shadowing this variable.
            if(variable.getAccessType() === 'BARE') {
                doNotShadow(anglScope, variable);
            }
            // If this is a module-provided variable, and the module's variable could theoretically be shadowed, then we must
            // tell this scope and parent scopes to avoid shadowing this variable.
            var containingObjectVariable = variable.getContainingObjectVariable();
            if(containingObjectVariable) {
                doNotShadow(anglScope, containingObjectVariable);
            }
            
            // Are we attempting to subscript this variable?
            // If so, attach Array type information to this variable.
            var indexNode = <astTypes.IndexNode>node.parentNode; // speculative downcast
            if(indexNode.type === 'index' && indexNode.expr === node) {
                var dataType = variable.getDataType();
                if(dataType == null && variable.canSetDataType()) (<scopeVariable.CanSetDataType>variable).setDataType(new variableTypes.ArrayType());
            }
        }

    });
}

function doNotShadow(anglScope: scope.AnglScope, variable: scopeVariable.AbstractVariable) {
    // Tell this scope and all parent scopes up to but not including the one that contains the variable.
    for(var scope = anglScope; !scope.hasVariable(variable); scope = scope.getParentScope()) {
        scope.doNotShadow(variable);
    }
}
