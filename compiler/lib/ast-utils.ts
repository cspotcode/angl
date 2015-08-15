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

export function findParent(astNode: astTypes.AstNode, parentTypes: Array<string>,                       includeStartNode?: boolean): astTypes.AstNode;
export function findParent(astNode: astTypes.AstNode, parentType: string,                               includeStartNode?: boolean): astTypes.AstNode;
export function findParent(astNode: astTypes.AstNode, callback: (astNode: astTypes.AstNode) => boolean, includeStartNode?: boolean): astTypes.AstNode;
export function findParent(astNode: astTypes.AstNode, filterCriteria: any,                              includeStartNode: boolean = false): astTypes.AstNode {
    var callback;
    if(typeof filterCriteria === 'function') callback = filterCriteria;
    else if(typeof filterCriteria === 'string') callback = (node) => node.type === filterCriteria;
    else callback = (node) => _.contains(filterCriteria, node.type);
    // If we are *not* considering the current node as a possible candidate, skip it right away and start the search with its parent.
    if(!includeStartNode) astNode = astNode.parentNode;
    while(true) {
        if(astNode == null) return null;
        if(callback(astNode)) return astNode;
        // Ascend the node tree
        astNode = astNode.parentNode;
    }
}

/**
 * Compares two NodeLocation instances, checking if one comes before the other one.
 * Returns -1 if a comes before b, 1 if a comes after b, and 0 otherwise.
 * @param a
 * @param b
 */
export function compareLocations(a: astTypes.NodeLocation, b: astTypes.NodeLocation): number {
    // If a is completely before b
    if(isBefore(a, b)) return -1;

    // If a is completely after b
    if(isBefore(b, a)) return 1;

    // Else one location is contained by the other, or the locations overlap.
    return 0;
}

/**
 * Returns true if `before` is completely before `after` (no overlap)
 */
export function isBefore(before: astTypes.NodeLocation, after: astTypes.NodeLocation): boolean {
    if(before.last_line < after.first_line) return true;
    if(before.last_line == after.first_line && before.last_column <= after.first_column) return true;
    return false;
}

/**
 * Returns true if `inside` is contained within `outside`
 */
export function isInside(inside: astTypes.NodeLocation, outside: astTypes.NodeLocation): boolean {
    if(outside.first_line > inside.first_line || (outside.first_line === inside.first_line && outside.first_column > inside.first_column)) return false;
    if(outside.last_line < inside.last_line || (outside.last_line === inside.last_line && outside.last_column < inside.last_column)) return false;
    return true;
}

/*
 * TODO what do we do if we're copying comments to a node that already has comments?
 * Do we prepend or append to the existing comments list?
 */

export function migrateComments(target: astTypes.AstNode, source: astTypes.AstNode, migrateBefore: boolean = true, migrateAfter: boolean = true) {
    if(target === source) return;
    
    if(!target.comments) {
        target.comments = {
            before: [],
            after: []
        };
    }

    if(source.comments) {
        if(migrateBefore && source.comments.before) {
            target.comments.before = source.comments.before.slice();
            source.comments.before.length = 0;
        }
        if(migrateAfter && source.comments.after) {
            target.comments.after = source.comments.after.slice();
            source.comments.after.length = 0;
        }
    }
}
