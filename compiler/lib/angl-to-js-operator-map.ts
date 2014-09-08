/// <reference path="../../typings/all.d.ts" />
"use strict";

import ops = require('./operator-precedence-and-associativity');
var OpEnum = ops.JavascriptOperatorsEnum;

export var anglToJsBinOps: {
    [anglOperator: string]: ops.JavascriptOperatorsEnum;
} = {
    '&&': OpEnum.LOGICAL_AND,
    '||': OpEnum.LOGICAL_OR,
    //'^^': has no Javascript equivalent
    '<': OpEnum.LESS_THAN,
    '<=': OpEnum.LESS_THAN_OR_EQUAL,
    '>': OpEnum.GREATER_THAN,
    '>=': OpEnum.GREATER_THAN_OR_EQUAL,
    '==': OpEnum.EQUALITY,
    '!=': OpEnum.INEQUALITY,
    '|': OpEnum.BITWISE_OR,
    '&': OpEnum.BITWISE_AND,
    '^': OpEnum.BITWISE_XOR,
    '<<': OpEnum.BITWISE_SHIFT_LEFT,
    '>>': OpEnum.BITWISE_SHIFT_RIGHT,
    '+': OpEnum.ADDITION,
    '-': OpEnum.SUBTRACTION,
    '*': OpEnum.MULTIPLICATION,
    '/': OpEnum.DIVISION,
    //'div': has no Javascript equivalent
    'mod': OpEnum.REMAINDER,
    '.': OpEnum.MEMBER_ACCESS
    //'->': has no Javascript equivalent
};

export var anglToJsUnOps: typeof anglToJsBinOps = {
    '!': OpEnum.LOGICAL_NOT,
    '~': OpEnum.BITWISE_NOT,
    '-': OpEnum.UNARY_NEGATION
};
