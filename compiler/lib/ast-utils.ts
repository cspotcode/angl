/// <reference path="../../typings/all.d.ts"/>
"use strict";

import astTypes = require('./ast-types');
import anglScope = require('./angl-scope');

// "Cleans" an AST node in preparation for moving it in the AST tree.
// The tree walker will take care of re-assigning the necessary properties based on the node's new tree position.
export var cleanNode = (astNode:astTypes.AstNode) => {
    astNode.parentNode = null;
    return astNode;
}

export var getAnglScope = (astNode:astTypes.AstNode):anglScope.AnglScope => {
    while(!astNode.anglScope) astNode = astNode.parentNode;
    return astNode.anglScope;
}

export var getGlobalAnglScope = (astNode:astTypes.AstNode):anglScope.AnglScope => {
    while(!astNode.globalAnglScope) astNode = astNode.parentNode;
    return astNode.globalAnglScope;
}

export var findParent = (astNode:astTypes.AstNode, callback:(astNode:astTypes.AstNode)=>boolean):astTypes.AstNode => {
    while(true) {
        astNode = astNode.parentNode;
        if(astNode == null) return null;
        if(callback(astNode)) return astNode;
    }
}
