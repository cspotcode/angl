/// <reference path="../../typings/all.d.ts"/>
"use strict";

import astTypes = require('./ast-types');
import anglScope = require('./angl-scope');

// "Cleans" an AST node in preparation for moving it in the AST tree.
// The tree walker will take care of re-assigning the necessary properties based on the node's new tree position.
export function cleanNode(astNode: astTypes.AstNode) {
    astNode.parentNode = null;
    return astNode;
}

export function getAnglScope(astNode: astTypes.AstNode): anglScope.AnglScope {
    while(!astNode.anglScope) astNode = astNode.parentNode;
    return astNode.anglScope;
}

export function getGlobalAnglScope(astNode: astTypes.AstNode): anglScope.AnglScope {
    while(!astNode.globalAnglScope) astNode = astNode.parentNode;
    return astNode.globalAnglScope;
}

export function findParent(astNode: astTypes.AstNode, callback: (astNode: astTypes.AstNode) => boolean, includeStartNode: boolean = false): astTypes.AstNode {
    // If we are *not* considering the current node as a possible candidate, skip it right away and start the search with its parent.
    if(!includeStartNode) astNode = astNode.parentNode;
    while(true) {
        if(astNode == null) return null;
        if(callback(astNode)) return astNode;
        // Ascend the node tree
        astNode = astNode.parentNode;
    }
}
