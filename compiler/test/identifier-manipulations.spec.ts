/// <reference path="../../typings/all.d.ts" />
/// <reference path="../../typings/test.d.ts" />
"use strict";

import chai = require('chai');
var expect = chai.expect;

import identifierManipulations = require('../lib/identifier-manipulations');
var Ident = identifierManipulations.Identifier;

describe('identifier-manipulations', () => {
    describe('Identifier', () => {
        it('should emit a prefix when parsing camelCase names', () => {
            expect(Ident.fromCamelCase('-fooBar').toUnderscores()).to.equal('-foo_bar');
            expect(Ident.fromCamelCase('__fooBar').toUnderscores()).to.equal('__foo_bar');
        });
        it('should emit a prefix when parsing under_score names', () => {
            expect(Ident.fromUnderscores('-foo_bar').toUnderscores()).to.equal('-foo_bar');
            expect(Ident.fromUnderscores('__foo_bar').toUnderscores()).to.equal('__foo_bar');
        });
        it('should emit a prefix when parsing hyphenated names', () => {
            expect(Ident.fromHyphenated('-foo-bar').toUnderscores()).to.equal('-foo_bar');
            expect(Ident.fromHyphenated('__foo-bar').toUnderscores()).to.equal('__foo_bar');
        });
        it('should emit a prefix when converting to camelCase', () => {
            expect(Ident.fromHyphenated('-foo-bar').toCamelCase()).to.equal('-fooBar');
        });
        it('should emit a prefix when converting to under_scores', () => {
            expect(Ident.fromHyphenated('-foo-bar').toUnderscores()).to.equal('-foo_bar');
        });
        it('should emit a prefix when converting to hyphenated', () => {
            expect(Ident.fromUnderscores('-foo_bar').toHyphenated()).to.equal('-foo-bar');
        });
        it('should lowercase everything when converting to hyphenated', () => {
            expect(Ident.fromUnderscores('fOO_bAr_Baz').toHyphenated()).to.equal('foo-bar-baz');
        });
        it('should capitalize the first word in CamelCase when passed true', () => {
            expect(Ident.fromUnderscores('fOO_BAr').toCamelCase(true)).to.equal('FooBar');
            expect(Ident.fromUnderscores('__fOO_BAr').toCamelCase(true)).to.equal('__FooBar');
        });
        it('should lowercase the first word in camelCase when passed false or nothing', () => {
            expect(Ident.fromUnderscores('fOO_BAr').toCamelCase(false)).to.equal('fooBar');
            expect(Ident.fromUnderscores('fOO_BAr').toCamelCase()).to.equal('fooBar');
        });
        it('should capitalize everything in UNDER_SCORE when passed true', () => {
            expect(Ident.fromCamelCase('fooBar').toUnderscores(true)).to.equal('FOO_BAR');
        });
        it('should lowercase everything in under_score when passed nothing or false', () => {
            expect(Ident.fromCamelCase('fooBar').toUnderscores(false)).to.equal('foo_bar');
            expect(Ident.fromCamelCase('fooBar').toUnderscores()).to.equal('foo_bar');
        });
        
    });
});

//// hyphen-to-camel
//assert(Ident.fromHyphenated('foo-bar-baz').toCamelCase() === 'fooBarBaz');
//assert(Ident.fromHyphenated('foo-bar-baz').toCamelCase(true) === 'FooBarBaz');
//assert(Ident.fromHyphenated('_foo-bar-baz').toCamelCase() === '_fooBarBaz');
//assert(Ident.fromHyphenated('-_foo-bar-baz').toCamelCase() === '-_fooBarBaz');
//
//// hyphen-to-underscore
//assert(Ident.fromHyphenated('foo-bar-baz').toUnderscores() === 'foo_bar_baz');
//assert(Ident.fromHyphenated('-foo-bar-baz').toUnderscores(true) === 'FOO_BAR_BAZ');
//assert(Ident.fromHyphenated('_foo-BAR-baz').toUnderscores() === '_foo_bar_baz');
//assert(Ident.fromHyphenated('-_foo-bar-baz').toUnderscores() === '-_foo_bar_baz');
//
//// underscore-to-camel
//
//// underscore-to-hyphen
//
//// camel-to-underscore
//assert(Ident.fromCamelCase('fooBarBaz').toUnderscores() === 'foo_bar_baz');
//assert(Ident.fromCamelCase('fooBarBaz').toUnderscores(true) === 'FOO_BAR_BAZ');
//
//// camel-to-hyphen


/*
 * TODO:
 * 
 * test all permutations of from* to*
 * - w/arguments being true/false for all-caps or initial-caps
 * - w/having no prefix, one-char prefix, and two-char prefixes
 * - w/input having uppercase and lowercase (make sure it gets normalized)
 */

/*
 * Nevermind, that whole "permutations" approach gets way too crazy.
 * Just do simpler tests for:
 *   toUnderscore produces prefix
 *   fromUnderscore parses prefix
 *   toUnderscore outputs all lowercase when false is passed
 *   toUnderscore does lowercase when nothing is passed
 *   etc.
 */
