/// <reference path="../../typings/all.d.ts"/>
"use strict";

import types = require('./ast-types');
import options = require('./options');
import treeWalker = require('./tree-walker');
var walk = treeWalker.walk;

export var transform = (ast: types.SimpleFileNode, opts: options.Options): types.AstNode => {
    // Sanity check that we received a simple_file node
    if(ast.type !== 'simple_file') {
        throw new Error('Expected "simple_file" node; got "' + ast.type + '" node.');
    }
    
    var commentIndex = 0;
    var comments = ast.allComments;
    var prevComment = undefined;
    var currComment = comments[0];
    var nextComment = comments[1];
    
    function iterComment() {
        commentIndex++;
        prevComment = currComment;
        currComment = comments[commentIndex];
        nextComment = comments[commentIndex + 1];
    }

    /**
     * Compares two NodeLocation instances, checking if one comes before the other one.
     * Returns -1 if a comes before b, 1 if a comes after b, and 0 otherwise.
     * @param a
     * @param b
     */
    function compareLocations(a: types.NodeLocation, b: types.NodeLocation): number {
        // If a is completely before b
        if(isAfter(a, b)) return -1;
        
        // If a is completely after b
        if(isAfter(b, a)) return 1;
        
        // Else one location is contained by the other, or the locations overlap.
        return 0;
    }

    /**
     * Returns true if b is completely after a (no overlap)
     * @param a
     * @param b
     */
    function isAfter(a: types.NodeLocation, b: types.NodeLocation): boolean {
        if(a.last_line < b.first_line) return true;
        if(a.last_line == b.first_line && a.last_column <= b.first_column) return true;
        return false;
    }
    
    walk(ast, (node: types.AstNode, parentNode: types.AstNode, locationInParent: string) => {
        
        // Attach comment information to this node
        node.comments = {
            before: [],
            after: []
        };
        
        while(currComment) {
            // Does the current node come after the current comment?  If so, attach the comment to the node.
            if(compareLocations(currComment.location, node.location) < 0) {
                node.comments.before.push(currComment);
                iterComment();
                continue;
            }
            break;
        }
    });
    
    return ast;
};
