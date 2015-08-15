/// <reference path="../../typings/all.d.ts" />
"use strict";

/**
 * Reserved words in both TypeScript and JavaScript
 */
var commonReservedWords = [
    // Note: commented entries are names that I thought were reserved words, but in fact are not.
    'for',
    'in',
    //'of',
    'while',
    'do',
    'until',
    'var',
    'if',
    'else',
    'class',
    'extends',
    'export',
    //'implements',
    //'interface',
    //'declare',
    //'module',
    'new',
    'delete'
];

/**
 * Set of all words that cannot be used as variable names in TypeScript
 */
export var typeScriptReservedWords: Array<string> = commonReservedWords.concat([
    // Reserved words specific to TypeScript.  I'm not sure if any such words exist.
]);

/**
 * Set of all words that cannot be used as variable names in JavaScript
 */
export var javaScriptReservedWords: Array<string> = commonReservedWords.concat([
    // Reserved words specific to JavaScript.  I'm not sure if any such words exist.
]);

