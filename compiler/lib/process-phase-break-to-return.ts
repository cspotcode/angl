/// <reference path="../../typings/all.d.ts" />
"use strict";

import _ = require('lodash');

import treeWalker = require('./tree-walker');
import astTypes = require('./ast-types');
import astUtils = require('./ast-utils');
var walk = treeWalker.walk;

var parentTypesForReturn = ['script', 'scriptdef', 'createdef', 'destroydef'];
var parentTypesForBreak = ['for', 'repeat', 'while', 'dountil', 'switch', 'with'];
var allParentTypes = parentTypesForReturn.concat(parentTypesForBreak);

export function transform(ast:astTypes.AstNode) {
    
    walk(ast, (node:astTypes.AstNode, parent:astTypes.AstNode, locationInParent:string) => {
        
        // An Angl break statement is equivalent to a JS return statement if it is not inside a loop.
        // Therefore we replace all break statements that aren't inside a loop with return statements that don't have a
        // return expression.
        if(node.type === 'break') {
            var parent = astUtils.findParent(node, (node) => _.contains(allParentTypes, node.type));
            if(_.contains(parentTypesForReturn, parent.type)) {
                var ret: astTypes.ReturnNode = {
                    type: 'return',
                    expr: null
                };
                return ret;
            }
        }
        
    });
}
