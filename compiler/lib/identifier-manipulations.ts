/// <reference path="../../typings/all.d.ts" />
"use strict";

// globally unique object
var priv = {};

/**
 * Utility class for transforming identifier names between different formats.
 * - camelCase or InitialCapsCamelCase
 * - using_underscores or CONST_VALUE_WITH_UNDERSCORES
 * - hyphenated-name
 */
export class Identifier {
    
    // TODO implement prefix-grabbing in all from* factory methods
    
    static fromCamelCase(name: string): Identifier {
        var p = Identifier._grabPrefix(name);
        var ret = new Identifier(priv);
        ret._prefix = p[0];
        ret._nameParts = p[1].split(/(?=[A-Z])/);
        ret._computeInitialCapital();
        return ret;
    }
    
    toCamelCase(initialCapital?: boolean): string {
        if(typeof initialCapital === 'undefined') initialCapital = this._initialCapital;
        return this._prefix
             + this._nameParts
                   .map((v, i) => initialCapital || i ? v.toLowerCase().replace(/^./, () => v[0].toUpperCase()) : v.toLowerCase())
                   .join('');
    }
    
    static fromUnderscores(name: string): Identifier {
        var p = Identifier._grabPrefix(name);
        var ret = new Identifier(priv);
        ret._prefix = p[0];
        ret._nameParts = p[1].split('_');
        ret._computeInitialCapital();
        return ret;
    }
    
    toUnderscores(allCaps: boolean = false): string {
        var nameParts;
        if(allCaps) {
            nameParts = this._nameParts.map((v) => v.toUpperCase());
        } else {
            nameParts = this._nameParts.map((v) => v.toLowerCase());
        }
        return this._prefix + nameParts.join('_');
    }
    
    static fromHyphenated(name: string): Identifier {
        var p = Identifier._grabPrefix(name);
        var ret = new Identifier(priv);
        ret._prefix = p[0];
        ret._nameParts = p[1].split('-');
        ret._computeInitialCapital();
        return ret;
    }
    
    toHyphenated(): string {
        return this._prefix + this._nameParts.map((v) => v.toLowerCase()).join('-');
    }
    
    private static _grabPrefix(name: string): Array<string> {
        var m = name.match(/([_-]*)(.*)/);
        return [m[1], m[2]];
    }
    
    private _computeInitialCapital() {
        this._initialCapital = this._nameParts[0] ? this._nameParts[0][0].toUpperCase() === this._nameParts[0][0] : false;
    }
    
    /*private*/ constructor(p) {
        if(p !== priv) throw new Error('Private constructor');
        this._nameParts = [];
        this._prefix = '';
    }
    
    private _nameParts: Array<string>;
    private _prefix: string;
    private _initialCapital: boolean;
    
}

export function autoConvertUnderscoreToCamel(identifier: string, returnUnmodifiedIdentifier: boolean = false) {
    // Test if this identifier appears to be a candidate for conversion from under_score to camelCase
    // Criteria:
    // * Contains an underscore following some non-underscore and non-hyphen character (in other words, we ignore leading underscores)
    // * Is not entirely uppercase.  Identifiers such as UPPER_CASE should not be renamed.
    if(/[^_-]_/.test(identifier) && identifier.toUpperCase() != identifier) {
        // Convert the identifier and return the result
        return Identifier.fromUnderscores(identifier).toCamelCase();
    } else {
        if(returnUnmodifiedIdentifier) return identifier;
        return null;
    }
}
