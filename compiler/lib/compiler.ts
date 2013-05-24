
// TODO change this to import ... module instead of var ... require
// possibly caused by this bug: http://typescript.codeplex.com/workitem/777
/// <reference path="angl.d.ts"/>
var angl = require('../../parser/out/angl');

import types = module('./ast-types');
import allTransformations = module('./run-all-transformations');
var main = require('./main');

export function compile(anglSourceCode:string):string {
    // Parse the angl source code into an AST
    var ast = angl.parse(anglSourceCode);
    return compileAst(ast);
}

export function compileAst(anglAst:types.AstNode):string {
    anglAst = allTransformations.runAllTransformations(anglAst);
    var jsSource = main(anglAst);
    return jsSource;
}
