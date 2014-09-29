/// <reference path="../../typings/all.d.ts" />
/// <reference path="../../typings/test.d.ts" />
"use strict";

require('./init');
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
    describe('autoConvertUnderscoreToCamel', () => {
        it('should convert under_score identifiers to camelCase', () => {
            expect(identifierManipulations.autoConvertUnderscoreToCamel('under_score_ident')).to.equal('underScoreIdent');
        });
        it('should leave CONST_VALUE identifiers intact', () => {
            expect(identifierManipulations.autoConvertUnderscoreToCamel('CONST_VALUE')).to.equal(null);
        });
        it('should convert identifiers with leading underscores', () => {
            expect(identifierManipulations.autoConvertUnderscoreToCamel('_leading_underscore')).to.equal('_leadingUnderscore');
        });
        it('should not convert identifiers whose only underscore is a leading underscore', () => {
            expect(identifierManipulations.autoConvertUnderscoreToCamel('_leadingunderscore')).to.equal(null);
        });
        it('should return unmodified identifier when passed true, return null otherwise', () => {
            expect(identifierManipulations.autoConvertUnderscoreToCamel('foo-bar', true)).to.equal('foo-bar');
            expect(identifierManipulations.autoConvertUnderscoreToCamel('foo-bar', false)).to.equal(null);
            expect(identifierManipulations.autoConvertUnderscoreToCamel('foo-bar')).to.equal(null);
        });
    });
});

