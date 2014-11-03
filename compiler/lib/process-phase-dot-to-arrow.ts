/// <reference path="../../typings/all.d.ts" />
"use strict";

import _ = require('lodash');

import treeWalker = require('./tree-walker');
import astTypes = require('./ast-types');
import astUtils = require('./ast-utils');
import variableTypes = require('./variable-types');
var walk = treeWalker.walk;

export function transform(ast:astTypes.AstNode) {
    
    walk(ast, (node:astTypes.AstNode, parent:astTypes.AstNode, locationInParent:string) => {
        
        // When using the dot operator to access properties of an Angl object, we should automatically
        // convert that dot operator into an Angl arrow operator.
        // This should be considered a convenient heuristic, not a 100% reliable feature.  It will not catch all
        // situations where the dot operator should be converted to an arrow operator, so you may need to manually edit
        // your Angl code in certain situations.
        var binOpNode = <astTypes.BinOpNode>node;
        if(node.type === 'binop' && binOpNode.op === '.') {
            // If left side of this dot operator is an identifier referring to a class
            var identifierNode = <astTypes.IdentifierNode>binOpNode.expr1;
            if(identifierNode.type === 'identifier' && identifierNode.variable && identifierNode.variable.getDataType() instanceof variableTypes.ClassType) {
                // replace this dot operator with an arrow operator.
                binOpNode.op = '->';
            }
        }
        
    });
}
