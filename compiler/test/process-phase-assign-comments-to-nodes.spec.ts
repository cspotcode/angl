/// <reference path="../../typings/all.d.ts" />
/// <reference path="../../typings/test.d.ts" />
"use strict";

require('./init');
import chai = require('chai');
import sinon = require('sinon');
var expect = chai.expect;

import processPhase = require('../lib/process-phase-assign-comments-to-nodes');
import astTypes = require('../lib/ast-types');

describe('AST transformation phase to attach comments & whitespace nodes into AST nodes', () => {
    it('Correctly removes leading indentation from multiline C-style comments', () => {
        var comment: astTypes.CommentNode = {
            text:
                    '/*\n' +
                '     * This is a multi-line C-style comment\n' +
                '     */',
            location: {
                first_line: 1,
                first_column: 4,
                last_line: 3,
                last_column: 7
            }
        };
        processPhase.trimIndentationFromCStyleComment(comment);
        expect(comment.text).to.equal(
            '/*\n' +
            ' * This is a multi-line C-style comment\n' +
            ' */');
        
        comment = {
            text:
                    '/*\n' +
                'stuff\n' +
                '*/',
            location: {
                first_line: 1,
                first_column: 4,
                last_line: 3,
                last_column: 6
            }
        };
        processPhase.trimIndentationFromCStyleComment(comment);
        expect(comment.text).to.equal(
            '/*\n' +
            'stuff\n' +
            '*/'
        );
    });
});
