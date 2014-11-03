/// <reference path="../../typings/all.d.ts"/>
"use strict";

// Install source-map support only when running in NodeJS
var sourceMapSupport: any = require('source-map-support');
sourceMapSupport && sourceMapSupport.install();

import glob = require('glob');
import _ = require('lodash');
import path = require('path');
import fs = require('fs');
import mkdirp = require('mkdirp');

import angl = require('./angl-parser');

import astTypes = require('./ast-types');
import globalScope = require('./global-scope');
import allTransformations = require('./run-all-transformations');
import findGlobals = require('./find-globals');
import jsGenerator = require('./main');
import options = require('./options');
import identifierManipulations = require('./identifier-manipulations');
var Ident = identifierManipulations.Identifier;

var defaultOptions = new options.Options();

export function compile(anglSourceCode:string, options: options.Options):string {
function normalizeNewlines(input: string): string {
    return input.replace(/\r\n/g, '\n');
}

    // Parse the angl source code into an AST
    anglSourceCode = normalizeNewlines(anglSourceCode);
    var ast = angl.parse(anglSourceCode);
    return compileAst(ast, null, options);
}

export function compileAst(anglAst:astTypes.AstNode, extraGlobalIdentifiers:string[] = [], options: options.Options = defaultOptions):string {
    // Manually create and assign a global scope to the AST
    var newGlobalScope = globalScope.createGlobalScope(options, extraGlobalIdentifiers);
    anglAst.globalAnglScope = newGlobalScope;
    anglAst = allTransformations.transform(anglAst, options);
    var jsSource = jsGenerator.generateCode(anglAst, options);
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
            sourceContent: normalizeNewlines(fs.readFileSync(path.resolve(sourcePath, filePath), 'utf8'))
        };
        // Generate an AST
        try {
            file.ast = angl.parse(file.sourceContent);
        } catch(e) {
            throw new Error('Parser error while parsing ' + file.sourcePath + ':\n' + e.message);
        }
        return file;
    });
    
    // Create a global scope
    var newGlobalScope = globalScope.createGlobalScope(options);
    
    console.log('Performing first transformation phase on each file...');
    var allFileAsts = <Array<astTypes.FileNode>>_.map(files, (file) => {
        file.ast.globalAnglScope = newGlobalScope;
        file.ast = allTransformations.transform(file.ast, options, allTransformations.Phases.BEGIN, allTransformations.Phases.ONE);
        var moduleDescriptor = (<astTypes.FileNode>file.ast).moduleDescriptor;
        moduleDescriptor.name = file.moduleName;
        moduleDescriptor.preferredIdentifier = _.last(file.moduleName.split('/'));
        if(/[^_-]-/.test(moduleDescriptor.preferredIdentifier))
            moduleDescriptor.preferredIdentifier = Ident.fromHyphenated(moduleDescriptor.preferredIdentifier).toCamelCase();
        moduleDescriptor.isRelative = true;
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
    projectNode = <astTypes.ProjectNode>allTransformations.transform(projectNode, options, allTransformations.Phases.ONE);
    
    console.log('Generating code...');
    _.each(files, (file: AnglFile) => {
        var jsSource = jsGenerator.generateCode(file.ast, options);
        file.compiledJs = jsSource;
    });

    console.log('Writing code to disc...');
    var extension = options.generateTypeScript ? '.ts' : 'js';
    // Output all of the Javascript to the filesystem
    _.each(files, (file:AnglFile) => {
        var outputPath = path.join(destinationPath, file.moduleName + extension);
        mkdirp.sync(path.dirname(outputPath));
        fs.writeFileSync(outputPath, file.compiledJs);
    });
        
}
