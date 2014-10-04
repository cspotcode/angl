/// <reference path="../../typings/all.d.ts" />
/// <reference path="../../typings/test.d.ts" />
"use strict";

require('./init');
import chai = require('chai');
import sinon = require('sinon');
var expect = chai.expect;

import main = require('../lib/main');
import options = require('../lib/options');

describe('JsGenerator', () => {
    describe('#codeForStringLiteral', () => {
        
        var opts: options.Options;
        var jsGenerator: main.JsGenerator;
        
        beforeEach(() => {
            opts = new options.Options();
            opts.generateTypeScript = false;
        });
        
        it('Generates correct single-quoted string', () => {
            opts.stringQuoteStyle = options.StringQuoteStyle.SINGLE;
            jsGenerator = new main.JsGenerator(opts);
            expect(jsGenerator.codeForStringLiteral("'hello,' he said")).to.equal("'\\'hello,\\' he said'");
            expect(jsGenerator.codeForStringLiteral('"goodbye" she replied')).to.equal("'\"goodbye\" she replied'");
        });
        
        it('Generates correct double-quoted string', () => {
            opts.stringQuoteStyle = options.StringQuoteStyle.DOUBLE;
            jsGenerator = new main.JsGenerator(opts);
            expect(jsGenerator.codeForStringLiteral("'hello,' he said")).to.equal("\"'hello,' he said\"");
            expect(jsGenerator.codeForStringLiteral('"goodbye" she replied')).to.equal("\"\\\"goodbye\\\" she replied\"");
        });
        
    });
});
