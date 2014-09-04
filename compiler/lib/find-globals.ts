/// <reference path="../../typings/all.d.ts"/>
"use strict";

import astTypes = module('./ast-types');
import astUtils = module('./ast-utils');
var _ = require('lodash');
import treeWalker = module('./tree-walker');

// Return an array of the names of all globals created by the Angl code
export var getGlobalNames = function(astRoot:astTypes.AstNode):string[] {
    var statements:astTypes.AstNode[];
    switch(astRoot.type) {
        case 'statements':
            statements = (<astTypes.StatementsNode>astRoot).list;
            break;
        
        case 'file':
            statements = (<astTypes.FileNode>astRoot).stmts;
            break;
        
        default:
            throw new Error('Unexpected root node of type "' + astRoot.type + '"');
    }
    
    var globalNames:string[] = [];
    
    _(statements).each(function(statement) {
        switch(statement.type) {
            case 'object':
            case 'const':
            case 'scriptdef':
                // All three node types have a "name" property
                globalNames.push((<astTypes.ObjectNode>statement).name);
                break;
        }
    });
    
    return globalNames;
}
