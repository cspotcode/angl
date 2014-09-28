/// <reference path="../../typings/all.d.ts" />
"use strict";

export class Options {
    
    renameUnderscoreToCamelCase: boolean = true;
    
    renameUnderscoreToCamelCaseForGlobals: boolean = true;
    
    spacesPerIndentationLevel: number = 4;
    
    generateAmdWrapper: boolean = false;
    
    generateUseStrict: boolean = false;
    
    stringQuoteStyle: StringQuoteStyle = StringQuoteStyle.SINGLE;
    
}

export enum StringQuoteStyle {
    SINGLE,
    DOUBLE
}
