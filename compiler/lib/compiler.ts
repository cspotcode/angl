/// <reference path="../../typings/all.d.ts"/>
"use strict";

import glob = require('glob');
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
var defaultOptions = new options.Options();

export function compile(anglSourceCode:string, options: options.Options):string {
    // Parse the angl source code into an AST
    var ast = angl.parse(anglSourceCode);
    return compileAst(ast, null, options);
}

export function compileAst(anglAst:astTypes.AstNode, extraGlobalIdentifiers:string[] = [], options: options.Options = defaultOptions):string {
    // Manually create and assign a global scope to the AST
    var newGlobalScope = globalScope.createGlobalScope(options, extraGlobalIdentifiers);
    anglAst.globalAnglScope = newGlobalScope;
    anglAst = allTransformations.runAllTransformations(anglAst, options);
    var jsSource = jsGenerator.generateJs(anglAst, options);
    return jsSource;
}

interface AnglFile {
    sourcePath: string;
    moduleName: string;
    ast?: astTypes.AstNode;
    globals?: string[];
    sourceContent?: string;
    compiledJs?: string;
}

export function compileDirectory(sourcePath: string, destinationPath: string, options: options.Options = defaultOptions) {
    
    if(!fs.statSync(sourcePath).isDirectory()) throw new Error('"' + sourcePath + '" is not a directory.');
    
    var filePaths = glob.sync('**/*.angl', {cwd: sourcePath});
    
    var files: Array<AnglFile> = _.map(filePaths, (filePath) => {
        // Create the file object
        var file:AnglFile = {
            sourcePath: filePath,
            moduleName: filePath.replace(/\.[^/]+?$/, ''),
            sourceContent: fs.readFileSync(path.resolve(sourcePath, filePath), 'utf8')
        };
        // Generate an AST
        file.ast = angl.parse(file.sourceContent);
        return file;
    });
    
    // Create a global scope
    var newGlobalScope = globalScope.createGlobalScope(options);
    
    console.log('Performing first transformation phase on each file...');
    var allFileAsts = <Array<astTypes.FileNode>>_.map(files, (file) => {
        file.ast.globalAnglScope = newGlobalScope;
        file.ast = allTransformations.runAllTransformations(file.ast, options, 0, 1);
        var moduleDescriptor = (<astTypes.FileNode>file.ast).moduleDescriptor;
        moduleDescriptor.name = file.moduleName;
        moduleDescriptor.preferredIdentifier = _.last(file.moduleName.split('/'));
        return file.ast;
    });
    
    // Generate a ProjectNode AST containing all files
    var projectNode: astTypes.ProjectNode = {
        type: 'project',
        files: allFileAsts,
        parentNode: null,
        anglScope: newGlobalScope,
        globalAnglScope: newGlobalScope
    };
    
    console.log('Performing remaining transformation phases on project...');
    projectNode = <astTypes.ProjectNode>allTransformations.runAllTransformations(projectNode, options, 1);
    
    console.log('Generating JavaScript source code...');
    _.each(files, (file: AnglFile) => {
        var jsSource = jsGenerator.generateJs(file.ast, options);
        file.compiledJs = jsSource;
    });

    console.log('Writing JavaScript code to disc...');
    // Output all of the Javascript to the filesystem
    _.each(files, (file:AnglFile) => {
        var outputPath = path.join(destinationPath, file.moduleName + '.js');
        fs.writeFileSync(outputPath, file.compiledJs);
    });
        
}
