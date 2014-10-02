/// <reference path="../../typings/all.d.ts" />
"use strict";

/**
 * Computes the relativeModule path for one module to require another
 * @param from path of the loading module
 * @param to path of the loaded module
 * @returns {string}
 */
export function relativeModule(from: string, to: string): string {
    var fromParts = from.split('/');
    var toParts = to.split('/');
    var c, i, l;
    // How much of these paths is the same?
    for(i = 0; i < Math.min(fromParts.length, toParts.length); i++) {
        if(fromParts[i] !== toParts[i]) break;
    }
    c = i;
    // i equals the index of the first non-matching pair
    var output = '';
    for(i = fromParts.length - 1; i > c; i--) {
        output += '../';
    }
    if(!output) output = './';
    for(i = c, l = toParts.length; i < l; i++) {
        output += toParts[i] + '/';
    }
    // Chop off that trailing slash
    return output.slice(0, -1);
}
