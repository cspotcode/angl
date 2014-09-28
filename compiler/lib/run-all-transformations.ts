/// <reference path="../../typings/all.d.ts"/>
"use strict";

import _ = require('lodash');
import types = require('./ast-types');
import options = require('./options');

export var transformers = [
    require('./process-phase-zero').transform,
    require('./process-phase-one').transform,
    require('./process-phase-resolve-identifiers-to-variables').transform,
    require('./process-phase-mark-method-calls').transform,
    require('./process-phase-assign-js-identifiers').transform
];

export function runAllTransformations(ast: types.AstNode, options: options.Options): types.AstNode {
    return _.reduce(transformers, (ast:types.AstNode, transformer) => ( transformer(ast, options) || ast ), ast);
};
