/// <reference path="../../typings/all.d.ts" />
/// <reference path="../../typings/test.d.ts" />
"use strict";

import vm = require('vm');

import compiler = require('../lib/compiler');
import options = require('../lib/options');

export function compileAndLoad(anglSource: string, opts: options.Options, sandbox?: any) {
    var jsCode = compiler.compileToCode(anglSource, opts);
    if(!sandbox) sandbox = createSandbox();
    vm.runInNewContext(jsCode, sandbox);
    return sandbox.module.exports;
}

export function createSandbox(modules: {[name: string]: any} = {}) {
    var exports = {};
    var ctx = {
        require: function(name) {
            return modules[name];
        },
        define: function(fn) {
            var ret = fn(ctx.require, ctx.exports, ctx.module);
            if(ret !== undefined) ctx.module.exports = ret;
        },
        module: {exports: exports},
        exports: exports
    };
    return ctx;
}
