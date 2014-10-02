/// <reference path="../../typings/all.d.ts"/>
"use strict";

import _ = require('lodash');
import types = require('./ast-types');
import options = require('./options');

export var transformers = [
    require('./process-phase-assign-comments-to-nodes').transform,
    require('./process-phase-zero').transform,
    require('./process-phase-one').transform,
    require('./process-phase-resolve-identifiers-to-variables').transform,
    require('./process-phase-mark-method-calls').transform,
    require('./process-phase-assign-js-identifiers').transform
];

export function runAllTransformations(ast: types.AstNode, options: options.Options, startPhase: number = 0, endPhase: number = Infinity): types.AstNode {
    return _.reduce(transformers.slice(startPhase, endPhase), (ast:types.AstNode, transformer) => ( transformer(ast, options) || ast ), ast);
};
