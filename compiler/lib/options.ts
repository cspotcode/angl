/// <reference path="../../typings/all.d.ts" />
"use strict";

export class Options {
    
    renameUnderscoreToCamelCase: boolean = true;
    
    renameUnderscoreToCamelCaseForGlobals: boolean = true;
    
    spacesPerIndentationLevel: number = 4;
    
    generateAmdWrapper: boolean = false;
    
    generateUseStrict: boolean = false;

    /**
     * Javascript implements short-circuit logical operators.  GML does not.
     * (short-circuiting means that `false && doStuff()` will never invoke `doStuff`.
     * 
     * If set to true, the generated code is allowed to use short-circuit logical
     * operators even though the original GML did not behave this way.
     * If false, the generated code will implement non-short-circuiting behavior.
     * @type {boolean}
     */
    generateShortCircuitBooleanLogic: boolean = true;

    /**
     * In GML, all logical operators evaluate to a number: 1 or 0.
     * In Javascript, logical operators evaluate to a boolean: true or false.
     * 
     * If true, the generated code for logical operators will explicitly coerce
     * their output to a number: 1 or 0.
     * If false, the generated code for logical operators will evaluate to
     * a boolean: true or false
     * @type {boolean}
     */
    coerceBooleanLogicToNumber: boolean = false;

    stringQuoteStyle: StringQuoteStyle = StringQuoteStyle.SINGLE;
    
}

export enum StringQuoteStyle {
    SINGLE,
    DOUBLE
}
