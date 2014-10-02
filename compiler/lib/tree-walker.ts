/// <reference path="../../typings/all.d.ts"/>
"use strict";

import nodeChildren = require('./ast-node-children');
import _ = require('lodash');
import types = require('./ast-types');

export interface WalkerFunction {
    (node:types.AstNode, parentNode:types.AstNode, locationInParent:string):any;
}

var setNodeParent = (node:types.AstNode, parent:types.AstNode) => {
    node.parentNode = parent;
}


/**
 * Walks an AST, calling fn for each node
 * fn(node, parent, locationInParent)
 * TODO allow fn to specify that a node should be re-processed via return value?
 * If fn returns:
 *   an object or array or objects, that object or array will replace the node in the tree
 *   null, node will be removed from the tree
 *   false, children will *not* be visited
 */
export function walk(rootNode:types.AstNode, fn:WalkerFunction) {
    setNodeParent(rootNode, null);
    // visit this node
    fn(rootNode, null, null);
    // visit children
    _walk(rootNode, fn);
}

/**
 * Visit all children of a node
 * @param node
 * @param fn
 * @private
 */
function _walk(node, fn) {
    var type = node.type;
    var children = nodeChildren[type];
    _.each(children, function(childName) {
        var child = node[childName];
        var ret;
        if(_.isArray(child)) {
            // Loop over an array of children
            var i
              , children = child
              ;
            for(i = 0; i < children.length; i++) {
                var child = children[i];
                setNodeParent(child, node);
                ret = fn(child, node, childName + '.' + i);
                // Null means the node must be removed (replaced with nothing)
                if(ret === null) ret = [];
                // Object means node must be replaced by the object
                if(_.isObject(ret) && !_.isArray(ret)) ret = [ret];
                // Array means node must be replaced by the array of node objects
                if(_.isArray(ret)) {
                    // Migrate comments from the old node to its replacement
                    if(ret.length) {
                        migrateComments(<types.AstNode>_.first(ret), child, true, false);
                        migrateComments(<types.AstNode>_.last(ret), child, false, true);
                    } else {
                        // TODO migrate comments onto the next peer node?
                        // What if there are no more peer nodes?  Then attach to the preceding node?
                        // What if there are no more preceding ndoes?  Then attach to the parent node?
                    }
                    var args = [i, 1].concat(ret);
                    children.splice.apply(children, args);
                    // Since this node has been replaced, we should immediately revisit it.
                    i--;
                    continue;
                }
                ret === false || _walk(child, fn);
            }
        } else if(child !== undefined) { // skip nodes that aren't present on the parent (e.g. if the child is optional)
            // Keep visiting the child node until it is *not* replaced.
            // If it *is* replaced, we want to immediately visit the replacement node by looping.
            while(true) {
                setNodeParent(child, node);
                ret = fn(child, node, childName);
                // Did the callback try to either remove this node or replace it with an array of nodes?
                if(ret === null || _.isArray(ret)) {
                    // In some situations, a single statement node can be converted into a Statements node
                    // (an array of statements).  Can we do that here?
                    if(    node.type === 'if' && childName === 'stmt'
                        || node.type === 'ifelse' && _.contains(['stmt1', 'stmt2'], childName)
                        || node.type === 'for' && childName === 'stmt'
                        ) {
                        // We can replace child with a StatementsNode containing the replacement statements.
                        var statementsNode: types.StatementsNode = {
                            type: 'statements',
                            list: ret || []
                        };
                        // Migrate comments
                        if(_.isArray(ret) && ret.length) {
                            // We are migrating comments from the child onto a non-empty array of replacement nodes
                            // Migrate before comments to the first replacement
                            migrateComments(<types.AstNode>_.first(ret), child, true, false);
                            // Migrate after comments to the last replacement
                            migrateComments(<types.AstNode>_.last(ret), child, false, true);
                        } else {
                            // We are replacing the previous node with nothing (either null or empty array)
                            // Therefore, migrate comments onto the replacement StatementsNode
                            migrateComments(statementsNode, child);
                        }
                        // Replace node with new StatementsNode
                        child = statementsNode;
                        node[childName] = statementsNode;
                        // Immediately revisit the new child.
                        continue;
                    }
                }
                if(ret === null) {
                    // null means node should be removed from the tree, but we can't do that unless the node is in a list
                    // (e.g. array of statements)
                    throw new Error('Cannot remove child node from parent type "' + node.type + '" at position "' + childName + '"');
                }
                if(_.isArray(ret)) {
                    // We cannot replace with node with an array of nodes
                    throw new Error('Cannot replace child node with multiple nodes, from parent type "' + node.type + '" at position "' + childName + '"');
                }
                if(_.isObject(ret)) {
                    // Migrate comments from the old node to the new one
                    migrateComments(ret, child);
                    // Replace node with returned object
                    child = ret;
                    node[childName] = child;
                    // immediately revisit the new child
                    continue;
                }
                ret === false || _walk(child, fn);
                break;
            }
        }
    });
}

/*
 * TODO what do we do if we're copying comments to a node that already has comments?
 * Do we prepend or append to the existing comments list?
 */

function migrateComments(target: types.AstNode, source: types.AstNode, migrateBefore: boolean = true, migrateAfter: boolean = true) {
    if(!target.comments) {
        target.comments = {
            before: [],
            after: []
        };
    }
    
    if(source.comments) {
        if(migrateBefore && source.comments.before) target.comments.before = source.comments.before;
        if(migrateAfter && source.comments.after) target.comments.after = source.comments.after;
    }
}
