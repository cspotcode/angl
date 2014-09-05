/// <reference path="../../typings/all.d.ts"/>
"use strict";

import treeWalker = require('./tree-walker');
import scope = require('./angl-scope');
import astTypes = require('./ast-types');
import astUtils = require('./ast-utils');
var walk = treeWalker.walk;

// Assign concrete identifier names to all unnamed Javascript variables
export var transform = (ast:astTypes.AstNode) => {
    walk(ast, (node:astTypes.AstNode, parent:astTypes.AstNode, locationInParent:string) => {
        astUtils.getAnglScope(node).assignJsIdentifiers();
    });
}
