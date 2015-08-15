define(function(require) {
"use strict";

var $ = require('jquery');
var ko = require('knockout');
var mousetrap = require('mousetrap');
require('mousetrap-global-bind');

var anglParser = require('angl-parser/angl');
var compiler = require('lib/compiler');

$(document).ready(function($) {
    
    // stores a reference to the HTML element into an observable or a property of the viewModel, or invokes a function
    // passing it the reference
    ko.bindingHandlers.elementReference = {
        init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var value = valueAccessor();
            if(typeof value === 'function') {
                value(element);
            } else if(typeof value === 'string') {
                viewModel[value] = element;
            } else {
                throw new Error('Bad binding value for "elementReference binding; must be a function, writable observable, or string.');
            }
        }
    };
    
    var viewModel = window.viewModel = {};
    (function() {
        this.view = ko.observable('js');
        this.parserErrors = ko.observable();
        this.compilerErrors = ko.observable();
        this.ast = ko.observable();
        this.stringifiedAst = ko.observable();
        this.compiledJs = ko.observable();
        this.inputAngl = ko.observable('');
        this.inputAnglTextArea = ko.observable();
        this.on_getPermalinkClicked = function() {
            var selection = getSelectionRange(this.inputAnglTextArea());
            var opts = {
                selectionStart: selection[0],
                selectionEnd: selection[1]
            };
            var hash = '#' + encodeURIComponent('\0' + JSON.stringify(opts) + '\0' + this.inputAngl());
            window.location.hash = hash;
        };
        this.setCodeSelection = function(start, end) {
            if(end == null) end = start;
            setSelectionRange(this.inputAnglTextArea(), start, end);
        }
        _.bindAll(this, 'on_getPermalinkClicked');

        var recompile = ko.computed(function() {
            var ast;
            try {
                ast = anglParser.parse(this.inputAngl());
                this.stringifiedAst(JSON.stringify(ast, null, '    '));
            } catch(e) {
                this.parserErrors(e.message);
                return;
            }
            this.parserErrors(undefined);
            try {
                this.compiledJs(compiler.compileAstToCode(ast));
            } catch(e) {
                this.compilerErrors(e.message);
                return;
            }
            this.compilerErrors(undefined);
        }, this).extend({throttle: 500});

    }).apply(viewModel);

    ko.applyBindings(viewModel);
    
    if(window.location.hash) {
        var decodedHash = decodeURIComponent(window.location.hash.replace(/^#?/, ''));
        var urlOpts;
        if(decodedHash[0] === '\0') {
            var split = decodedHash.split('\0');
            urlOpts = JSON.parse(split[1]);
            viewModel.inputAngl(split[2]);
        } else {
            urlOpts = {};
            viewModel.inputAngl(decodedHash);
        }
        viewModel.setCodeSelection(urlOpts.selectionStart || 0, urlOpts.selectionEnd || urlOpts.selectionStart || 0);
    }

    
    mousetrap.bindGlobal('ctrl+shift+l', viewModel.on_getPermalinkClicked);
    
    // Utility functions for setting the selection or cursor position in a <textarea>
    // Stolen from http://stackoverflow.com/a/499158
    function setSelectionRange(input, selectionStart, selectionEnd) {
        if (input.setSelectionRange) {
            input.focus();
            input.setSelectionRange(selectionStart, selectionEnd);
        }
        else if (input.createTextRange) {
            var range = input.createTextRange();
            range.collapse(true);
            range.moveEnd('character', selectionEnd);
            range.moveStart('character', selectionStart);
            range.select();
        }
    }

    function setCaretToPos (input, pos) {
        setSelectionRange(input, pos, pos);
    } 
    
    function getSelectionRange(input) {
        // TODO support the other selection API?
        return [input.selectionStart, input.selectionEnd];
    }
});

});
