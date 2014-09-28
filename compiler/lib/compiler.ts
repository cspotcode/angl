/// <reference path="../../typings/all.d.ts"/>
"use strict";

import _ = require('lodash');
import path = require('path');
import fs = require('fs');

import angl = require('./angl-parser');

import astTypes = require('./ast-types');
import globalScope = require('./global-scope');
import allTransformations = require('./run-all-transformations');
import findGlobals = require('./find-globals');
import jsGenerator = require('./main');
import options = require('./options');
var fileset = require('fileset');
var defaultOptions = new options.Options();

export function compile(anglSourceCode:string):string {
    // Parse the angl source code into an AST
    var ast = angl.parse(anglSourceCode);
    return compileAst(ast);
}

export function compileAst(anglAst:astTypes.AstNode, extraGlobalIdentifiers:string[] = []):string {
    // Manually create and assign a global scope to the AST
    var newGlobalScope = globalScope.createGlobalScope(extraGlobalIdentifiers);
    anglAst.globalAnglScope = newGlobalScope;
    anglAst = allTransformations.runAllTransformations(anglAst, defaultOptions);
    var jsSource = jsGenerator.generateJs(anglAst, defaultOptions);
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
        
        var files: Array<AnglFile> = _.map(filePaths, (filePath) => {
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
            var globalIdentifiers = <Array<string>>_(files).filter((file, i2) => i2 !== i).pluck('globals').flatten().value();
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
