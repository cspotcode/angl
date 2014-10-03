/// <reference path="../../typings/all.d.ts" />
"use strict";

import _ = require('lodash');

import astTypes = require('./ast-types');

/**
 * Returns true if this expression must be wrapped in parentheses when nested within the parent
 * expression, based on both expression's operators.
 * @param operator
 * @param parentOperator
 * @param locationInParent
 * @returns {boolean}
 */
export function needsParentheses(operator: JavascriptOperatorsEnum, parentOperator: JavascriptOperatorsEnum, locationInParent: Location) {
    var operatorInfo = JavascriptOperators[operator];
    var parentOperatorInfo = JavascriptOperators[parentOperator];
    
    var operators = [operator, parentOperator];

    // Exception: if the NEW_SANS_ARGS and FUNCTION_CALL operators are nested, parentheses *must* be included.
    // Otherwise it will parse as a NEW_WITH_ARGS
    // e.g.:
    //   (new Foo)() or new (Foo()).
    // Without the parentheses, it's:
    //   new Foo()
    // ...which is a different thing entirely.
    if(_.contains(operators, JavascriptOperatorsEnum.NEW_SANS_ARGS) && _.contains(operators, JavascriptOperatorsEnum.FUNCTION_CALL)) {
        return true;
    }
    
    // Exception: if the MEMBER_ACCESS and FUNCTION_CALL nodes are nested, parentheses are never required.
    // This is because JavaScript syntax prevents the parser from ever needing to use operator precedence rules;
    // there is only one valid interpretation.
    // For example: a.b() is equivalent to (a.b)(), and a.(b()) is invalid syntax.
    // Similarly, a().b is equivalent to (a()).b, and a(().b) does not make any sense.
    if(_.contains(operators, JavascriptOperatorsEnum.MEMBER_ACCESS) && _.contains(operators, JavascriptOperatorsEnum.FUNCTION_CALL)) {
        return false;
    }
    
    // If the operator has higher precedence than its parent, then no parentheses are required.
    if(operatorInfo.precedence < parentOperatorInfo.precedence) {
        return false;
    }
    // If the operator has lower precedence than its parent, then parentheses must be included.
    if(operatorInfo.precedence > parentOperatorInfo.precedence) {
        return true;
    }
    
    // operators have equal precedence. Check their associativity:
    if(operatorInfo.associativity === Associativity.LEFT_TO_RIGHT && locationInParent === Location.LEFT) {
        return false;
    } else if(operatorInfo.associativity === Associativity.RIGHT_TO_LEFT && locationInParent === Location.RIGHT) {
        return false;
    }
    
    // TODO deal with N/A associativity?
    
    return true;
}

/**
 * Location of an expression inside a parent operator expression.
 * For example, in the expression (a * b):
 *   the parent operator is multiply
 *   a's location inside the parent is LEFT
 *   b's location inside the parent is RIGHT
 * In the expression (!c):
 *   c's location is N_A since ! is a prefix operator with only one child expression
 *   TODO should it be RIGHT since it's to the right of the operator?  Does this play nicer with the associativity of
 *   prefix and postfix operators?
 */
export enum Location {
    N_A,
    LEFT,
    RIGHT
}

export enum JavascriptOperatorsEnum {
    GROUPING,                       // parentheses  ( ... )
    MEMBER_ACCESS,                  // foo.bar
    SUBSCRIPTING,                   // foo['bar'] or foo[0]
    NEW_WITH_ARGS,                  // new Foo(1, 2, 3)
    FUNCTION_CALL,                  // foo(1, 2)
    NEW_SANS_ARGS,                  // new Foo
    POSTFIX_INCREMENT,              // foo++
    POSTFIX_DECREMENT,              // foo--
    LOGICAL_NOT,                    // !foo
    BITWISE_NOT,                    // ~foo
    UNARY_PLUS,                     // +foo
    UNARY_NEGATION,                 // -foo
    PREFIX_INCREMENT,               // ++foo
    PREFIX_DECREMENT,               // --foo
    TYPEOF,                         // typeof foo
    VOID,                           // void foo
    DELETE,                         // delete foo.bar
    MULTIPLICATION,                 // foo * bar
    DIVISION,
    REMAINDER,                      // foo % bar
    ADDITION,
    SUBTRACTION,
    BITWISE_SHIFT_LEFT,             // foo << 2
    BITWISE_SHIFT_RIGHT,            // foo >> 2
    BITWISE_SHIFT_RIGHT_UNSIGNED,   // foo >>> 2
    LESS_THAN,
    LESS_THAN_OR_EQUAL,
    GREATER_THAN,
    GREATER_THAN_OR_EQUAL,
    IN,                             // 'hello' in foo
    INSTANCEOF,                     // foo instanceof Foo
    EQUALITY,                       // ==
    INEQUALITY,                     // !=
    STRICT_EQUALITY,                // ===
    STRICT_INEQUALITY,              // !==
    BITWISE_AND,                    // &
    BITWISE_XOR,                    // ^
    BITWISE_OR,                     // |
    LOGICAL_AND,                    // &&
    LOGICAL_OR,                     // ||
    CONDITIONAL,                    // foo ? 'truthy' : 'falsy'
    YIELD,                          // not sure; we are not using it regardless
    ASSIGNMENT,                     // foo = 2;
    SPREAD,                         // foo(...bar);
    COMMA,                          // a = 1, 2, 3
    WRAPPED_IN_PARENTHESES          // Not a JS operator.  Used when the expression is wrapped in parentheses,
                                    // making any extra parentheses unnecessary.  For example,
                                    // if(a == b)
                                    // The "==" expression never needs to add its own parentheses because if()
                                    // already supplies them.
}

export enum Associativity {
    N_A, // not applicable
    LEFT_TO_RIGHT,
    RIGHT_TO_LEFT
}

// for each operator, store some basic information:
// Operator precedence
// Operator associativity

export var JavascriptOperators: {
    [operator: number/*JavascriptOperatorsEnum*/]: {
        /**
         * Highest precedence == lowest number (precedence == 0 is highest precedence, == 19 is low precedence)
         */
        precedence: number;
        associativity: Associativity;
        name: string;
    }
} = {};

function operator(op: JavascriptOperatorsEnum, precedence: number, associativity: Associativity) {
    JavascriptOperators[op] = {
        precedence: precedence,
        associativity: associativity,
        name: JavascriptOperatorsEnum[op]
    };
}

operator(JavascriptOperatorsEnum.GROUPING,                     0,  Associativity.N_A);
operator(JavascriptOperatorsEnum.MEMBER_ACCESS,                1,  Associativity.LEFT_TO_RIGHT);
operator(JavascriptOperatorsEnum.SUBSCRIPTING,                 1,  Associativity.LEFT_TO_RIGHT);
operator(JavascriptOperatorsEnum.NEW_WITH_ARGS,                1,  Associativity.N_A);
operator(JavascriptOperatorsEnum.FUNCTION_CALL,                2,  Associativity.LEFT_TO_RIGHT);
operator(JavascriptOperatorsEnum.NEW_SANS_ARGS,                2,  Associativity.RIGHT_TO_LEFT);
operator(JavascriptOperatorsEnum.POSTFIX_INCREMENT,            3,  Associativity.N_A);
operator(JavascriptOperatorsEnum.POSTFIX_DECREMENT,            3,  Associativity.N_A);
operator(JavascriptOperatorsEnum.LOGICAL_NOT,                  4,  Associativity.RIGHT_TO_LEFT);
operator(JavascriptOperatorsEnum.BITWISE_NOT,                  4,  Associativity.RIGHT_TO_LEFT);
operator(JavascriptOperatorsEnum.UNARY_PLUS,                   4,  Associativity.RIGHT_TO_LEFT);
operator(JavascriptOperatorsEnum.UNARY_NEGATION,               4,  Associativity.RIGHT_TO_LEFT);
operator(JavascriptOperatorsEnum.PREFIX_INCREMENT,             4,  Associativity.RIGHT_TO_LEFT);
operator(JavascriptOperatorsEnum.PREFIX_DECREMENT,             4,  Associativity.RIGHT_TO_LEFT);
operator(JavascriptOperatorsEnum.TYPEOF,                       4,  Associativity.RIGHT_TO_LEFT);
operator(JavascriptOperatorsEnum.VOID,                         4,  Associativity.RIGHT_TO_LEFT);
operator(JavascriptOperatorsEnum.DELETE,                       4,  Associativity.RIGHT_TO_LEFT);
operator(JavascriptOperatorsEnum.MULTIPLICATION,               5,  Associativity.LEFT_TO_RIGHT);
operator(JavascriptOperatorsEnum.DIVISION,                     5,  Associativity.LEFT_TO_RIGHT);
operator(JavascriptOperatorsEnum.REMAINDER,                    5,  Associativity.LEFT_TO_RIGHT);
operator(JavascriptOperatorsEnum.ADDITION,                     6,  Associativity.LEFT_TO_RIGHT);
operator(JavascriptOperatorsEnum.SUBTRACTION,                  6,  Associativity.LEFT_TO_RIGHT);
operator(JavascriptOperatorsEnum.BITWISE_SHIFT_LEFT,           7,  Associativity.LEFT_TO_RIGHT);
operator(JavascriptOperatorsEnum.BITWISE_SHIFT_RIGHT,          7,  Associativity.LEFT_TO_RIGHT);
operator(JavascriptOperatorsEnum.BITWISE_SHIFT_RIGHT_UNSIGNED, 7,  Associativity.LEFT_TO_RIGHT);
operator(JavascriptOperatorsEnum.LESS_THAN,                    8,  Associativity.LEFT_TO_RIGHT);
operator(JavascriptOperatorsEnum.LESS_THAN_OR_EQUAL,           8,  Associativity.LEFT_TO_RIGHT);
operator(JavascriptOperatorsEnum.GREATER_THAN,                 8,  Associativity.LEFT_TO_RIGHT);
operator(JavascriptOperatorsEnum.GREATER_THAN_OR_EQUAL,        8,  Associativity.LEFT_TO_RIGHT);
operator(JavascriptOperatorsEnum.IN,                           8,  Associativity.LEFT_TO_RIGHT);
operator(JavascriptOperatorsEnum.INSTANCEOF,                   8,  Associativity.LEFT_TO_RIGHT);
operator(JavascriptOperatorsEnum.EQUALITY,                     9,  Associativity.LEFT_TO_RIGHT);
operator(JavascriptOperatorsEnum.INEQUALITY,                   9,  Associativity.LEFT_TO_RIGHT);
operator(JavascriptOperatorsEnum.STRICT_EQUALITY,              9,  Associativity.LEFT_TO_RIGHT);
operator(JavascriptOperatorsEnum.STRICT_INEQUALITY,            9,  Associativity.LEFT_TO_RIGHT);
operator(JavascriptOperatorsEnum.BITWISE_AND,                  10, Associativity.LEFT_TO_RIGHT);
operator(JavascriptOperatorsEnum.BITWISE_XOR,                  11, Associativity.LEFT_TO_RIGHT);
operator(JavascriptOperatorsEnum.BITWISE_OR,                   12, Associativity.LEFT_TO_RIGHT);
operator(JavascriptOperatorsEnum.LOGICAL_AND,                  13, Associativity.LEFT_TO_RIGHT);
operator(JavascriptOperatorsEnum.LOGICAL_OR,                   14, Associativity.LEFT_TO_RIGHT);
operator(JavascriptOperatorsEnum.CONDITIONAL,                  15, Associativity.RIGHT_TO_LEFT);
operator(JavascriptOperatorsEnum.YIELD,                        16, Associativity.RIGHT_TO_LEFT);
operator(JavascriptOperatorsEnum.ASSIGNMENT,                   17, Associativity.RIGHT_TO_LEFT);
operator(JavascriptOperatorsEnum.SPREAD,                       18, Associativity.N_A);
operator(JavascriptOperatorsEnum.COMMA,                        19, Associativity.LEFT_TO_RIGHT);
operator(JavascriptOperatorsEnum.WRAPPED_IN_PARENTHESES,       20, Associativity.N_A);

