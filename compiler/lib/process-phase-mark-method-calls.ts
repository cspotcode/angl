/// <reference path="../../typings/all.d.ts"/>
"use strict";

import treeWalker = module('./tree-walker');
import astTypes = module('./ast-types');
var walk = treeWalker.walk;

// Mark all funccalls of the form `foo.bar()` (as opposed to `bar()`) as method calls, because JavaScript will
// automatically bind the proper `this` value.
export var transform = (ast:astTypes.AstNode) => {
    walk(ast, (node:astTypes.AstNode, parent:astTypes.AstNode, locationInParent:string) => {

        // mark function calls that don't need their `this` context to be explicitly set in Javascript
        // For example `a.b()` doesn't need it's `this` context manually set because JS will set it to `a`.
        // `c()` must be generated as `c.call(this, ...)` in order to pass the desired `this` context into the function.
        if(node.type === 'funccall') {
            var funcNode = <any>node;
            if(funcNode.expr.type === 'binop' && funcNode.expr.op === '.') {
                funcNode.isMethodCall = true;
            }
        }
    });
};
