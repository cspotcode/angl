/// <reference path="../../typings/all.d.ts"/>
"use strict";

// AST transformation phase two

import treeWalker = require('./tree-walker');
import scope = require('./angl-scope');
import astTypes = require('./ast-types');
import astUtils = require('./ast-utils');
var walk = treeWalker.walk;

// Create scopes for all nodes
export var transform = (ast:astTypes.AstNode) => {
    walk(ast, (node, parent, locationInParent:string) => {
        if(node.type === 'identifier') {
            // If this identifier node is actually a property name for property access (e.g. the `bar` in `foo.bar`)
            // then it does *not* resolve to a variable in scope.
            if(locationInParent === 'expr2' && parent.type === 'binop' && parent.op === '.') {
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
            node.variable = variable;
            // If this variable is from a parent scope, then we must tell this scope not to shadow it.
            if(!anglScope.hasVariable(variable)) {
                anglScope.doNotShadow(variable);
            }
        }

    });
}
