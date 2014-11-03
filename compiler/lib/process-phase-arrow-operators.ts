/// <reference path="../../typings/all.d.ts" />
"use strict";

import _ = require('lodash');

import treeWalker = require('./tree-walker');
var walk = treeWalker.walk;
import astTypes = require('./ast-types');
import astUtils = require('./ast-utils');
import variableTypes = require('./variable-types');
import strings = require('./strings');
import operators = require('./operator-precedence-and-associativity');

export function transform(ast:astTypes.AstNode) {

    walk(ast, (node:astTypes.AstNode, parent:astTypes.AstNode, locationInParent:string): astTypes.AstNode => {
        
        if (node.type === 'assign') {
            var assignNode = <astTypes.AssignNode>node;
            // Is the lval an arrow operator?
            if (assignNode.lval.type === 'binop' && (<astTypes.BinOpNode>assignNode.lval).op === '->') {
                var arrowLeft = (<astTypes.BinOpNode>assignNode.lval).expr1;
                var arrowRight = <astTypes.IdentifierNode>(<astTypes.BinOpNode>assignNode.lval).expr2;
                // Replace this assign node with a call to the runtime's arrowAssign method
                var fieldString:astTypes.StringNode = {
                    type: 'string',
                    val: arrowRight.name
                };
                var assignReplacement:astTypes.JsFuncCallNode = {
                    type: 'jsfunccall',
                    expr: strings.ANGL_RUNTIME_IDENTIFIER + '.arrowAssign',
                    args: [arrowLeft, fieldString, assignNode.rval],
                    op: operators.JavascriptOperatorsEnum.MEMBER_ACCESS
                };
                return assignReplacement;
            }
        }

        // Catch all arrow operators that aren't captured and replaced by the logic above
        if (node.type === 'binop' && (<astTypes.BinOpNode>node).op === '->') {
            var arrowNode = <astTypes.BinOpNode>node;
            var resolveCall:astTypes.JsFuncCallNode = {
                type: 'jsfunccall',
                expr: strings.ANGL_RUNTIME_IDENTIFIER + '.arrowResolve',
                args: [arrowNode.expr1],
                op: operators.JavascriptOperatorsEnum.MEMBER_ACCESS
            };
            var arrowReplacement:astTypes.BinOpNode = {
                type: 'binop',
                op: '.',
                expr1: resolveCall,
                expr2: arrowNode.expr2
            };
            return arrowReplacement;
        }
    });
    
}
