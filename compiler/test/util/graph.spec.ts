/// <reference path="../../../typings/all.d.ts" />
/// <reference path="../../../typings/test.d.ts" />
"use strict";

require('../init');
import chai = require('chai');
import sinon = require('sinon');
var expect = chai.expect;

import _ = require('lodash');

import graph = require('../../lib/util/graph');

describe('Graph data structure', () => {
    describe('cycle detection', () => {
        
        var g;
        function addEdge(a: string) {
            g.addEdge(a[0], a[1], 1, a[0] + '-' + a[1]);
        }
        function removeEdge(a: string) {
            g.removeEdge(a[0], a[1]);
        }
        function initGraph() {
            g = new graph.Graph();
            g.addNode('a');
            g.addNode('b');
            g.addNode('c');
            g.addNode('d');
            g.addNode('e');
            g.addNode('f');
            g.addNode('g');

        }
        function getCycle() {
            var cycle = g.findCycle();
            if(!cycle) return cycle;
            var edgeNames = cycle.map((e) => e.data);
            // rotate the array so that the minimum item comes first
            // for example, [2, 3, 1, 1.5] becomes [1, 1.5, 2, 3]
            var slicePoint = edgeNames.indexOf(_.first(_.sortBy(edgeNames, _.identity)));
            return edgeNames.slice(slicePoint).concat(edgeNames.slice(0, slicePoint));
        }
        beforeEach(() => {
            initGraph();
        });
        it('Should find cycles', () => {
            addEdge('ac');
            addEdge('ae');
            addEdge('eb');
            addEdge('ab');
            addEdge('bd');
            addEdge('ce');
            addEdge('ee');
            
            expect(getCycle()).to.deep.equal(['e-e']);
            
            removeEdge('ee');
            
            expect(getCycle()).to.equal(null);
            
            addEdge('df');
            addEdge('fg');
            addEdge('fe');
            
            expect(getCycle()).to.deep.equal(['b-d', 'd-f', 'f-e', 'e-b']);
            
        });
    });
});
