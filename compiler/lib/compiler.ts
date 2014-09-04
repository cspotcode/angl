/// <reference path="../../typings/all.d.ts"/>
"use strict";

// TODO change this to import ... module instead of var ... require
// possibly caused by this bug: http://typescript.codeplex.com/workitem/777
/// <reference path="angl.d.ts"/>
var angl = require('../../parser/out/angl');

import astTypes = module('./ast-types');
import globalScope = module('./global-scope');
import allTransformations = module('./run-all-transformations');
import path = module('path');
import fs = module('fs');
import findGlobals = module('./find-globals');
var jsGenerator = require('./main');
var fileset = require('fileset');
var _ = require('lodash');

export function compile(anglSourceCode:string):string {
    // Parse the angl source code into an AST
    var ast = angl.parse(anglSourceCode);
    return compileAst(ast);
}

export function compileAst(anglAst:astTypes.AstNode, extraGlobalIdentifiers?:string[] = []):string {
    // Manually create and assign a global scope to the AST
    var newGlobalScope = globalScope.createGlobalScope(extraGlobalIdentifiers);
    anglAst.globalAnglScope = newGlobalScope;
    anglAst = allTransformations.runAllTransformations(anglAst);
    var jsSource = jsGenerator.generateJs(anglAst);
    return jsSource;
}

interface AnglFile {
    path: string;
    ast?: astTypes.AstNode;
    globals?: string[];
    sourceContent?: string;
    compiledJs?: string;
}

export function compileDirectory(directoryPath:string, cb:(err, message?:string)=>void) {
    
    try {
        if(!fs.statSync(directoryPath).isDirectory()) throw new Error('"' + directoryPath + '" is not a directory.');
    } catch(err) {
        return cb(err);
    }
    
    fileset(path.join(directoryPath, '**/*.angl'), '', (err, filePaths?:string[]) => {
        if(err) return cb(err);
        
        var files = _.map(filePaths, (filePath) => {
            // Create the file object
            var file:AnglFile = {
                path: filePath,
                sourceContent: fs.readFileSync(filePath, 'utf8')
            };
            // Generate an AST
            file.ast = angl.parse(file.sourceContent);
            return file;
        });
        
        // Find the globals created by each file
        _.each(files, (file) => {
            file.globals = findGlobals.getGlobalNames(file.ast);
        });
        
        // Compile each file into JavaScript
        _.each(files, (file:AnglFile, i) => {
            // Build the list of global identifiers from *other* files
            var globalIdentifiers:string[] = _(files).filter((file, i2) => i2 !== i).pluck('globals').flatten().value();
            console.log(globalIdentifiers);
            file.compiledJs = compileAst(file.ast, globalIdentifiers);
        });
        
        // Output all of the Javascript to the filesystem
        _.each(files, (file:AnglFile) => {
            var outputPath = file.path + '.js';
            fs.writeFileSync(outputPath, file.compiledJs);
        });
        
        return cb(null, 'Success!');
    });
}
