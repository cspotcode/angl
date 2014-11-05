/// <reference path="../../typings/all.d.ts"/>
"use strict";

import _ = require('lodash');

import arrayIter = require('./util/array-iter');
import types = require('./ast-types');
import astUtils = require('./ast-utils');
import options = require('./options');
import treeWalker = require('./tree-walker');
var walk = treeWalker.walk;

export function trimIndentationFromCStyleComment(comment: types.CommentNode) {
    var lines = comment.text.split('\n');
    var indentationLevel = comment.location.first_column;
    for(var i = 1; i < lines.length; i++) {
        for(var j = 0; j < lines[i].length && j < indentationLevel && ~' \t'.indexOf(lines[i][j]); j++) {}
        lines[i] = lines[i].slice(j);
    }
    comment.text = lines.join('\n');
}

export var transform = (ast: types.SimpleFileNode, opts: options.Options): types.AstNode => {
    // Sanity check that we received a simple_file node
    if(ast.type !== 'simple_file') {
        throw new Error('Expected "simple_file" node; got "' + ast.type + '" node.');
    }
    
    var previousComment: types.CommentNode;
    ast.allComments = _.filter(ast.allComments, (comment, i, comments) => {
        
        // If this is a whitespace node (not a C or C++-style comment)
        if(~' \t\n'.indexOf(comment.text[0])) {
            // Strip the comment down to only its newlines, removing the comment entirely if the result is an empty comment
            comment.text = comment.text.replace(/[ \t]/g, '');
            
            // remove blank comments from array
            if(!comment.text.length) return false;
        }
        
        // If this is a C-style comment node
        if(comment.text[1] === '*') {
            trimIndentationFromCStyleComment(comment);
        }

        previousComment = comment;
        return true;
    });
    
    var comments = new arrayIter.Iter(ast.allComments);
    
    var nodeA: types.AstNode = null;
    var nodeB: types.AstNode = null;
    
    var walkFn = (node: types.AstNode, parentNode: types.AstNode, locationInParent: string) => {
        
        // Attach comment information to this node
        node.comments = {
            before: [],
            after: []
        };

        // If there are no more comments, there is nothing for us to do.
        if(!comments.peek()) return;
        
        // For the first two nodes, just grab a reference and move on to the next node
        if(!nodeA) {
            nodeA = node;
            return;
        }
        if(!nodeB) {
            nodeB = node;
            return;
        }
        
        // Whenever two incoming nodes start at the same position, use the later node and ignore the earlier one.
        if(node.location.first_line === nodeB.location.first_line && node.location.first_column === nodeB.location.first_column) {
            nodeB = node;
            return;
        }
        
        // Is nodeB contained within nodeA?  If so, there may be comments within nodeA that should be attached to "before" nodeB
        if(astUtils.isInside(nodeB.location, nodeA.location)) {
            while(comments.peek() && astUtils.isBefore(comments.peek().location, nodeB.location)) {
                nodeB.comments.before.push(comments.next());
            }
        }
        
        // if nodeA.parentNode comes before nodeB and there are comments inside of nodeA.parentNode, attach those comments
        // to "after" nodeA.

        var childNode = nodeA;
        var parentNode = nodeA.parentNode;
        var nextComment: types.CommentNode;

        while(parentNode && astUtils.isBefore(parentNode.location, nodeB.location)) {
            while (nextComment = comments.peek()) {
                if (astUtils.compareLocations(nextComment.location, parentNode.location) === 0) {
                    childNode.comments.after.push(nextComment);
                    comments.next();
                } else {
                    // We just looked at a comment that is not inside parentNode.  We've gone too far; stop looping.
                    break;
                }
            }

            // ascend the AST to check for comments inside the parent's parent
            childNode = parentNode;
            parentNode = childNode.parentNode;
            
            // If childNode ends at a different position than nodeA, change nodeA.
            // Basically, nodeA is changed to ascends the tree only when the new nodeA ends at a different position.
            // This means that, given two nodes ending at the exact same position, we'll attach adjacent comments to the inner-most node.
            if(childNode.location.last_column !== nodeA.location.last_column || childNode.location.last_line !== nodeA.location.last_line)
                nodeA = childNode;
        }
        
        // At this point, nodeA and nodeB are beside each other (one is not inside the other).  nodeA is completely
        // before nodeB and there are (possibly) comments between them.  Attach those comments to either nodeA.after or nodeB.before.
        
        // Everything up to and including the first newline should be attached to nodeA.after
        // Everything else should be attached to nodeB.before
        var attachedNewlineToNodeA = false;
        while(nextComment = comments.peek()) {
            if(astUtils.isBefore(nextComment.location, nodeB.location)) {
                if(!attachedNewlineToNodeA) {
                    if(~nextComment.text.indexOf('\n')) {
                        // Attach a single newline to after nodeA
                        nodeA.comments.after.push({
                            text: '\n',
                            location: {
                                first_line: nextComment.location.first_line,
                                first_column: nextComment.location.first_column,
                                last_line: nextComment.location.first_line,
                                last_column: nextComment.location.first_column
                            }
                        });
                        attachedNewlineToNodeA = true;
                        // Remove newline from the comment
                        nextComment.text = nextComment.text.replace('\n', '');
                    } else {
                        nodeA.comments.after.push(nextComment);
                    }
                }
                if(attachedNewlineToNodeA) {
                    nodeB.comments.before.push(nextComment);
                }
                
                comments.next();
            } else {
                // We just looked at a comment that is not before nodeB.  We've gone too far; stop looping.
                break;
            }
        }
        
        // Done.  nodeB becomes our new nodeA and we continue walking the AST to find a new nodeB.
        nodeA = nodeB;
        nodeB = node;
        
    };
    
    walk(ast, walkFn);
    // Run the walker callback two more times with dummy nopNodes that are located after the entire AST.
    // This allow the comment assigning logic to assign any trailing comments to the correct nodes.
    var nopNode1: types.NopNode = {
        type: 'nop',
        location: {
            first_line: ast.location.last_line,
            first_column: ast.location.last_column,
            last_line: ast.location.last_line,
            last_column: ast.location.last_column
        }
    };
    var nopNode2 = <types.NopNode>_.cloneDeep(nopNode1);
    nopNode2.location.first_column++;
    nopNode2.location.last_column++;
    walkFn(nopNode1, null, null);
    walkFn(nopNode2, null, null);
    
    // attach all remaining comments, and any comments that were attached to our dummy nopNodes,
    // onto nodeA (nodeB is one of our dummy nopNodes)
    _.each(nopNode1.comments.before.concat(nopNode1.comments.after, nopNode2.comments.before, nopNode2.comments.after), (comment) => {
        nodeA.comments.after.push(comment);
    });
    while(comments.peek()) {
        nodeA.comments.after.push(comments.next());
    }
    
    return ast;
};
