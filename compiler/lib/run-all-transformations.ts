/// <reference path="../../typings/all.d.ts"/>
"use strict";

var _ = require('lodash');
import types = module('./ast-types');

var transformers = [
    require('./process-phase-zero').transform,
    require('./process-phase-one').transform,
    require('./process-phase-resolve-identifiers-to-variables').transform,
    require('./process-phase-mark-method-calls').transform,
    require('./process-phase-assign-js-identifiers').transform
];

export var runAllTransformations = (ast:types.AstNode):types.AstNode => {
    return _.reduce(transformers, (ast:types.AstNode, transformer) => ( transformer(ast) || ast ), ast);
};
