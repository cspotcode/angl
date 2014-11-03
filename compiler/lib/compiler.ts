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
import scopeVariable = require('./scope-variable');
import allTransformations = require('./run-all-transformations');
import findGlobals = require('./find-globals');
import jsGenerator = require('./main');
import options = require('./options');
import identifierManipulations = require('./identifier-manipulations');
var Ident = identifierManipulations.Identifier;

var defaultOptions = new options.Options();

function normalizeNewlines(input: string): string {
    return input.replace(/\r\n/g, '\n');
}

export interface AbstractCompileOptions {
    /**
     * Compiler options.
     */
    options?: options.Options;
    /**
     * The name of a module that can be require'd to create the globalVariables array.
     */
    globalVariablesModule?: string;
    /**
     * Array of globalVariables to be added to global scope before compiling code.
     */
    globalVariables?: Array<scopeVariable.AbstractVariable>;
    /**
     * TODO
     */
    resources?: {
        sprites?: Array<string>;
        backgrounds?: Array<string>;
        sounds?: Array<string>;
    };
}

export interface CompileOptions extends AbstractCompileOptions {
    anglSourceCode: string;
}

export function compile(opts: CompileOptions): string;
export function compile(anglSourceCode: string, options: options.Options): string;
export function compile(arg0: any, arg1?: any):string {
    var anglSourceCode: string, options: options.Options, opts: CompileOptions;
    if(typeof arg0 === 'object') {
        opts = arg0;
        anglSourceCode = opts.anglSourceCode;
        options = opts.options;
    } else {
        anglSourceCode = arg0;
        options = arg1;
    }
    // Parse the angl source code into an AST
    anglSourceCode = normalizeNewlines(anglSourceCode);
    var ast = angl.parse(anglSourceCode);
    return compileAst(ast, null, options);
}

export interface CompileAstOptions extends AbstractCompileOptions {
    anglAst: astTypes.AstNode;
    extraGlobalIdentifiers: Array<string>;
}

export function compileAst(opts: CompileAstOptions): string;
export function compileAst(anglAst: astTypes.AstNode, extraGlobalIdentifiers?: Array<string>, options?: options.Options): string;
export function compileAst(arg0: any, arg1?: any, arg2?: any): string {
    var anglAst: astTypes.AstNode,
        extraGlobalIdentifiers: Array<string>,
        options: options.Options,
        opts: CompileAstOptions;
    if(typeof arg0.type === 'string') {
        // arg0 is an ast
        anglAst = arg0;
        extraGlobalIdentifiers = typeof arg1 === 'undefined' ? [] : arg1;
        options = typeof arg2 === 'undefined' ? defaultOptions : arg2;
    } else {
        opts = arg0;
        anglAst = opts.anglAst;
        extraGlobalIdentifiers = opts.extraGlobalIdentifiers || [];
        options = opts.options || defaultOptions;
    }
    
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

export interface CompileDirectoryOptions extends AbstractCompileOptions {
    src: string;
    dest: string;
}

export function compileDirectory(opts: CompileDirectoryOptions);
export function compileDirectory(sourcePath: string, destinationPath: string, options: options.Options);
export function compileDirectory(arg0: any, arg1?: any, arg2?: any) {
    var opts: CompileDirectoryOptions;
    if(typeof arg0 === 'object') {
        opts = arg0;
    } else {
        opts = {
            src: <string>arg0,
            dest: <string>arg1,
            options: <options.Options>arg2
        }
    }
    var sourcePath = opts.src,
        destinationPath = opts.dest,
        options = opts.options || defaultOptions;
    
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
    var newGlobalScope = globalScope.createGlobalScope(options, undefined, opts.globalVariables || []);
    
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
