/// <reference path="../../typings/all.d.ts" />
/// <reference path="../../typings/test.d.ts" />
"use strict";

require('./init');
import chai = require('chai');
import sinon = require('sinon');
var expect = chai.expect;

import util = require('./util');
import options = require('../lib/options');
import strings = require('../lib/strings');

describe('boolean values', () => {
    var opts: options.Options;
    var sandbox: any;
    var trueValue = {}, falseValue = {};
    var modules: any;
    var _module: any;
    var anglSource = [
        'export script getTrue() {',
        '    return true;',
        '}',
        'export script getFalse() {',
        '    return false;',
        '}'
    ].join('\n');
    
    beforeEach(() => {
        opts = new options.Options();
        opts.generateTypeScript = false;
        modules = {};
        modules[strings.ANGL_GLOBALS_MODULE] = {
            true: trueValue,
            false: falseValue
        };
        sandbox = util.createSandbox(modules);
    });
    
    it('should evaluate to true and false when compiler option is false', () => {
        opts.trueAndFalseAreNumberConstants =false;
        _module = util.compileAndLoad(anglSource, opts, sandbox);
        expect(_module.getTrue()).to.equal(true);
        expect(_module.getFalse()).to.equal(false);
    });
    
    it('should access global constant values when compiler option is true', () => {
        opts.trueAndFalseAreNumberConstants = true;
        _module = util.compileAndLoad(anglSource, opts, sandbox);
        expect(_module.getTrue()).to.equal(trueValue);
        expect(_module.getFalse()).to.equal(falseValue);
    });
});
