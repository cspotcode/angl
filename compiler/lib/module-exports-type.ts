/// <reference path="../../typings/all.d.ts" />
"use strict";

/**
 * A module can either export a single value (`module.exports = value` or `export = value`)
 * or export multiple values as properties on the exports object
 * (`exports.name = value` or `export class|var|function`)
 */
enum ModuleExportsType {
    SINGLE,
    MULTI,
    UNKNOWN
}

export = ModuleExportsType;
