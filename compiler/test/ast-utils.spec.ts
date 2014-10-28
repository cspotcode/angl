/// <reference path="../../typings/all.d.ts" />
/// <reference path="../../typings/test.d.ts" />
"use strict";

require('./init');
import chai = require('chai');
import sinon = require('sinon');
var expect = chai.expect;

import astUtils = require('../lib/ast-utils');
import astTypes = require('../lib/ast-types');

describe('ast-utils:', () => {
    describe('location comparisons: ', () => {
        /*
         * Locations are created on this grid:
         * line 1.  ABCD
         * line 2.  EFGH
         * line 3.  IJKL
         * line 4.  MNOP
         */
        var coordMap = {
            A: [1, 1], B: [2, 1], C: [3, 1], D: [4, 1],
            E: [1, 2], F: [2, 2], G: [3, 2], H: [4, 2],
            I: [1, 3], J: [2, 3], K: [3, 3], L: [4, 3],
            M: [1, 4], N: [2, 4], O: [3, 4], P: [4, 4]
        }
        function loc(coords: string): astTypes.NodeLocation {
            return {
                first_line: coordMap[coords[0]][1],
                first_column: coordMap[coords[0]][0],
                last_line: coordMap[coords[1]][1],
                last_column: coordMap[coords[1]][0]
            }
        }
        it('<testing some test logic>', () => {
            expect(loc('GM')).to.deep.equal({
                first_line: 2,
                first_column: 3,
                last_line: 4,
                last_column: 1
            });
        });
        
        describe('#isInside', () => {
            it('returns true when first argument is inside of second argument, false otherwise.', () => {

                expect(astUtils.isInside(loc('AF'), loc('AF'))).to.equal(true);
                expect(astUtils.isInside(loc('FK'), loc('AP'))).to.equal(true);
                expect(astUtils.isInside(loc('FK'), loc('EK'))).to.equal(true);
                expect(astUtils.isInside(loc('FK'), loc('FL'))).to.equal(true);
                expect(astUtils.isInside(loc('HI'), loc('GJ'))).to.equal(true);
                expect(astUtils.isInside(loc('HI'), loc('HI'))).to.equal(true);
                expect(astUtils.isInside(loc('BC'), loc('BC'))).to.equal(true);
                expect(astUtils.isInside(loc('BC'), loc('AD'))).to.equal(true);

                expect(astUtils.isInside(loc('FK'), loc('KP'))).to.equal(false);
                expect(astUtils.isInside(loc('FK'), loc('KP'))).to.equal(false);
                expect(astUtils.isInside(loc('IL'), loc('JK'))).to.equal(false);
                expect(astUtils.isInside(loc('GJ'), loc('HI'))).to.equal(false);
            });
        });
        
        describe('#isBefore', () => {
            it('returns true when first argument is before second argument, false otherwise', () => {
                expect(astUtils.isBefore(loc('AF'), loc('GL'))).to.equal(true);
                expect(astUtils.isBefore(loc('CD'), loc('EF'))).to.equal(true);
                expect(astUtils.isBefore(loc('GH'), loc('IJ'))).to.equal(true);
                expect(astUtils.isBefore(loc('GH'), loc('HI'))).to.equal(true);

                expect(astUtils.isBefore(loc('AC'), loc('BD'))).to.equal(false);
                expect(astUtils.isBefore(loc('CD'), loc('AB'))).to.equal(false);
                expect(astUtils.isBefore(loc('IJ'), loc('IJ'))).to.equal(false);
                expect(astUtils.isBefore(loc('EF'), loc('CD'))).to.equal(false);
            });
        });
        
    });
});
