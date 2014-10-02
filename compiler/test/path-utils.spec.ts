/// <reference path="../../typings/all.d.ts" />
/// <reference path="../../typings/test.d.ts" />
"use strict";

require('./init');
import chai = require('chai');
import sinon = require('sinon');
var expect = chai.expect;

import pathUtils = require('../lib/path-utils');

describe('path-utils', () => {
    describe('#relativeModule', () => {
        it('generates correct relativeModule paths', () => {
            expect(pathUtils.relativeModule('foo/bar/baz', 'foo/bar/baz')).to.equal('.');
            expect(pathUtils.relativeModule('foo/bar/baz', 'foo/bar2/baz')).to.equal('../bar2/baz');
            expect(pathUtils.relativeModule('foo/bar/baz', 'now/something/completely/different')).to.equal('../../now/something/completely/different');
            expect(pathUtils.relativeModule('now/something/completely/different', 'foo/bar/baz')).to.equal('../../../foo/bar/baz');
        });
    });
});
