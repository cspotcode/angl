/// <reference path="../../typings/all.d.ts" />
/// <reference path="../../typings/test.d.ts" />
"use strict";

require('./init');
import chai = require('chai');
import sinon = require('sinon');
var expect = chai.expect;

import util = require('./util');
import compiler = require('../lib/compiler');
import options = require('../lib/options');

describe('Logical operators', () => {
    var anglSource = [
        'export script doOr(a, b) {',
        '    return a() or b();',
        '}',
        '',
        'export script doAnd(a, b) {',
        '    return a() and b();',
        '}',
        '',
        'export script doXor(a, b) {',
        '    return a() ^^ b();',
        '}',
        '',
        'export script doNot(a) {',
        '    return not a();',
        '}'
    ].join('\n');
        
    function compileAndLoad() {
        return util.compileAndLoad(anglSource, opts);
    }
    
    var opts: options.Options;
    var _module;
    var a, b;
    
    beforeEach(() => {
        opts = new options.Options();
        opts.generateTypeScript = false;
    });

    function resetSpies(aVal, bVal) {
        a = sinon.spy(() => aVal);
        b = sinon.spy(() => bVal);
    }
    
    function describeCoercingToNumber() {
        it('should return a number', () => {
            resetSpies(true, true);
            expect(_module.doOr(a, b)).to.equal(1);
            expect(_module.doAnd(a, b)).to.equal(1);
            expect(_module.doXor(a, b)).to.equal(0);
            expect(_module.doNot(a)).to.equal(0);

            resetSpies(false, false);
            expect(_module.doOr(a, b)).to.equal(0);
            expect(_module.doAnd(a, b)).to.equal(0);
            expect(_module.doXor(a, b)).to.equal(0);
            expect(_module.doNot(a)).to.equal(1);

            resetSpies(true, false);
            expect(_module.doOr(a, b)).to.equal(1);
            expect(_module.doAnd(a, b)).to.equal(0);
            expect(_module.doXor(a, b)).to.equal(1);
        });
    }
    
    function describeNotCoercingToNumber() {
        it('should return a boolean', () => {
            resetSpies(true, true);
            expect(_module.doOr(a, b)).to.equal(true);
            expect(_module.doAnd(a, b)).to.equal(true);
            expect(_module.doXor(a, b)).to.equal(false);
            expect(_module.doNot(a)).to.equal(false);

            resetSpies(false, false);
            expect(_module.doOr(a, b)).to.equal(false);
            expect(_module.doAnd(a, b)).to.equal(false);
            expect(_module.doXor(a, b)).to.equal(false);
            expect(_module.doNot(a)).to.equal(true);

            resetSpies(true, false);
            expect(_module.doOr(a, b)).to.equal(true);
            expect(_module.doAnd(a, b)).to.equal(false);
            expect(_module.doXor(a, b)).to.equal(true);
        });
    }
    
    function describeShortCircuiting() {
        it('should short-circuit', () => {
            resetSpies(true, true);
            _module.doOr(a, b);
            expect(a).to.have.been.calledOnce;
            expect(b).to.not.have.been.called;

            resetSpies(false, true);
            _module.doAnd(a, b);
            expect(a).to.have.been.calledOnce;
            expect(b).to.not.have.been.called;

            // xor can't short-circuit
            resetSpies(false, false);
            _module.doXor(a, b);
            expect(a).to.have.been.calledOnce;
            expect(b).to.have.been.calledOnce;
        });
    }
    
    function describeNotShortCircuiting() {
        it('should not short-circuit', () => {
            resetSpies(true, true);
            _module.doOr(a, b);
            expect(a).to.have.been.calledOnce;
            expect(b).to.have.been.calledOnce;

            resetSpies(false, true);
            _module.doAnd(a, b);
            expect(a).to.have.been.calledOnce;
            expect(b).to.have.been.calledOnce;

            resetSpies(false, false);
            _module.doXor(a, b);
            expect(a).to.have.been.calledOnce;
            expect(b).to.have.been.calledOnce;
        });
    }
    
    describe('coercing to number', () => {
        
        beforeEach(() => {
            opts.coerceBooleanLogicToNumber = true;
        });
        
        describe('not short-circuiting', () => {
            
            beforeEach(() => {
                opts.generateShortCircuitBooleanLogic = false;
                _module = compileAndLoad();
            });

            describeCoercingToNumber();
            describeNotShortCircuiting();
            
        });
        describe('short-circuiting', () => {
            
            beforeEach(() => {
                opts.generateShortCircuitBooleanLogic = true;
                _module = compileAndLoad();
            });

            describeCoercingToNumber();
            describeShortCircuiting();
            
        });
    });
    
    describe('not coercing to number', () => {
        
        beforeEach(() => {
            opts.coerceBooleanLogicToNumber = false;
        });
        
        describe('not short-circuiting', () => {
            
            beforeEach(() => {
                opts.generateShortCircuitBooleanLogic = false;
                _module = compileAndLoad();
            });

            describeNotCoercingToNumber();
            describeNotShortCircuiting();
            
        });
        
        describe('short-circuiting', () => {
            
            beforeEach(() => {
                opts.generateShortCircuitBooleanLogic = true;
                _module = compileAndLoad();
            });

            describeNotCoercingToNumber();
            describeShortCircuiting();
            
        });
    });
});
