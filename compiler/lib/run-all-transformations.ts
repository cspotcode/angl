/// <reference path="../../typings/all.d.ts"/>
"use strict";

import _ = require('lodash');
import types = require('./ast-types');
import options = require('./options');

export var transformerFns = [
    require('./process-phase-assign-comments-to-nodes').transform,
    require('./process-phase-zero').transform,
    require('./process-phase-break-to-return').transform,
    require('./process-phase-one').transform,
    require('./process-phase-resolve-identifiers-to-variables').transform,
    require('./process-phase-dot-to-arrow').transform,
    require('./process-phase-arrow-operators').transform,
    require('./process-phase-mark-method-calls').transform,
    require('./process-phase-assign-js-identifiers').transform
];

export enum Phases {
    ASSIGN_COMMENTS,
    ZERO,
    BREAK_TO_RETURN,
    ONE,
    RESOLVE_IDENTIFIERS_TO_VARIABLES,
    DOT_TO_ARROW,
    ARROW_OPERATORS,
    MARK_METHOD_CALLS,
    ASSIGN_JS_IDENTIFIERS,
    
    // So that we can easily refer to the first phase and after the last phase:
    END,
    BEGIN = 0
}

// sanity-check that we have the same number of Phases as transformerFns
if(Phases.END !== transformerFns.length) {
    throw new Error('Length of transformerFns does not match length of Phases enum.');
}

export function transform(ast: types.AstNode, options: options.Options, startPhase?: Phases, endPhase?: Phases): types.AstNode {
    if(typeof startPhase === 'undefined') startPhase = Phases.BEGIN;
    if(typeof endPhase === 'undefined') endPhase = Phases.END;
    return _.reduce(transformerFns.slice(startPhase, endPhase), (ast:types.AstNode, transformer) => ( transformer(ast, options) || ast ), ast);
};
