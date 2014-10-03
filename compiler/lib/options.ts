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

    /**
     * In GML, true is a global variable storing the value 1, and
     * false is a global variable that stores the value 0.
     * In JavaScript, true and false are primitive boolean values,
     * not numbers.
     * 
     * If this option is true, all references to true and false in Angl
     * will resolve to the true and false constants, like in GML.
     * If this option is false, all references to true and false in Angl
     * will resolve to the Javascript versions of true and false.
     * @type {boolean}
     */
    trueAndFalseAreNumberConstants: boolean = false;

    stringQuoteStyle: StringQuoteStyle = StringQuoteStyle.SINGLE;

    /**
     * Should we generate TypeScript instead of JavaScript?
     * @type {boolean}
     */
    generateTypeScript: boolean = true;
    
    typeScriptReferencePath: string = 'typings.d.ts';
    
}

export enum StringQuoteStyle {
    SINGLE,
    DOUBLE
}
