/// <reference path="../../typings/all.d.ts" />
"use strict";

import _ = require('lodash');

import options = require('./options');
import ModuleDescriptor = require('./module-descriptor');
import astTypes = require('./ast-types');
import astUtils = require('./ast-utils');
import scopeVariable = require('./scope-variable');
import jsGenerator = require('./main');
import ops = require('./operator-precedence-and-associativity');
var OpEnum = ops.JavascriptOperatorsEnum;

/**
 * "Option-bag" configuration object passed to the `AdvancedGlobalVariable` constructor
 */
export interface CustomVariableDescriptor {
    /*
     * TODO
     * make properties optional:
     *     jsName
     *     usesThisBinding
     *     module?
     *     otherModules
     *     all three generate* functions
     */
    
    /**
     * Name of this identifier in Angl
     */
    name: string;
    
    /**
     * Name in JavaScript
     */
    jsName?: string;
    
    module?: ModuleDescriptor;
    
    usesThisBinding?: boolean;
    
    acceptsOtherArgument?: boolean;
    
    otherModules?: Array<ModuleDescriptor>;
    
    generateGetter?: (ctx: GetterGeneratorContext) => void;
    generateSetter?: (ctx: SetterGeneratorContext) => void;
    generateInvocation?: (ctx: InvocationGeneratorContext) => void;

    /**
     * If false, compiling code that attempts to set the value of this variable will throw an error.
     */
    canBeSet?: boolean;

    /**
     * If false, compiling code that attempts to invoke this variable will throw an error.
     */
    canBeInvoked?: boolean;
}


export interface CodeGeneratorContext {
    /**
     * A reference to the variable itself (the variable for whom code is being generated)
     */
    variable: AdvancedGlobalVariable;
    jsGenerator: jsGenerator.JsGenerator;
    options: options.Options;
    /**
     * The AST 'file' node within which we are generating code.
     */
    fileNode: astTypes.FileNode;
    getVariableForModule(module:ModuleDescriptor): scopeVariable.AbstractVariable;
    getProxyOfVariable(variable:scopeVariable.AbstractVariable): scopeVariable.AbstractVariable;
}

export interface MightNeedParenthesesCodeGeneratorContext extends CodeGeneratorContext {
    // So that we can generate parentheses correctly
    parentExpressionType: ops.JavascriptOperatorsEnum;
    locationInParentExpression: ops.Location;
    needsParentheses(op:ops.JavascriptOperatorsEnum): boolean;
}

/**
 * Context object passed to `generateGetter`
 */
export interface GetterGeneratorContext extends CodeGeneratorContext, MightNeedParenthesesCodeGeneratorContext {
}

/**
 * Context object passed to `generateSetter`
 */
export interface SetterGeneratorContext extends CodeGeneratorContext {
    valueToBeSet: astTypes.ExpressionNode;
    generateValueToBeSet(): void;
}

/**
 * Context object passed to `generateInvocation`
 */
export interface InvocationGeneratorContext extends CodeGeneratorContext, MightNeedParenthesesCodeGeneratorContext {

    /**
     * List of arguments passed to the function.
     */
    args: Array<astTypes.ExpressionNode>;
    
    /**
     * Convenience function to generate code for the list of arguments passed to this function.
     * Generates the arguments separated by commas.  Does not generate any wrapping parentheses.
     */
    generateArgumentsList(): void;
}

/**
 * Subclass of AbstractVariable designed to make it easier to implement global runtime variables with custom
 * code-generation.
 * 
 * Wraps the default generateGetter, generateSetter, and generateInvocation APIs with new ones that pass a context object.
 * This context object contains many useful properties and methods to assist in generating custom code.
 */
export class AdvancedGlobalVariable extends scopeVariable.Variable {
    
    private _generateGetter: (ctx: GetterGeneratorContext) => void;
    private _generateSetter: (ctx: SetterGeneratorContext) => void;
    private _generateInvocation: (ctx: InvocationGeneratorContext) => void;

    _shouldNotGenerateSetter(ctx) {
        throw new Error('This variable should never be set.');
    }
    
    _shouldNotGenerateInvocation(ctx) {
        throw new Error('This variable should never be invoked.');
    }
    
    constructor(opts: CustomVariableDescriptor) {
        super(null, scopeVariable.AllocationType.NONE, scopeVariable.AccessType.PROP_ACCESS); // TODO pick the correct strings
        this.setIdentifier(opts.name);
        if(opts.jsName) this.setJsIdentifier(opts.jsName);
        this.setUsesThisBinding(opts.usesThisBinding == null ? true : opts.usesThisBinding);
        this.setAcceptsOtherArgument(opts.acceptsOtherArgument == null ? false : opts.acceptsOtherArgument);
        this._generateGetter = opts.generateGetter;
        if(opts.canBeSet === false) {
            this._generateSetter = this._shouldNotGenerateSetter;
        } else {
            this._generateSetter = opts.generateSetter;
        }
        if(opts.canBeInvoked === false) {
            this._generateInvocation = this._shouldNotGenerateInvocation;
        } else {
            this._generateInvocation = opts.generateInvocation;
        }
        
        if(opts.module) this.setProvidedByModule(opts.module);
    }
    
    private _createCodeGeneratorContext(codeGenerator: jsGenerator.JsGenerator, astContext: astTypes.AstNode): CodeGeneratorContext {
        var fileNode = <astTypes.FileNode>astUtils.findParent(astContext, (node: astTypes.AstNode) => node.type === 'file', true);
        var ctx: CodeGeneratorContext = {
            variable: this,
            jsGenerator: codeGenerator,
            options: codeGenerator.getOptions(),
            fileNode: fileNode,
            getVariableForModule(module: ModuleDescriptor): scopeVariable.AbstractVariable {
                return fileNode.getVariableForDependency(module);
            },
            getProxyOfVariable(variable: scopeVariable.AbstractVariable): scopeVariable.AbstractVariable {
                return fileNode.getLocalProxyForModuleVariable(variable);
            }
        };
        return ctx;
    }
    
    private _addParenthesesPropertiesToCodeGeneratorContext(ctx: CodeGeneratorContext, parentExpressionType: ops.JavascriptOperatorsEnum, locationInParentExpression: ops.Location): MightNeedParenthesesCodeGeneratorContext {
        var _ctx = <MightNeedParenthesesCodeGeneratorContext>ctx;
        _ctx.locationInParentExpression = locationInParentExpression;
        _ctx.parentExpressionType = parentExpressionType;
        _ctx.needsParentheses = function(op: ops.JavascriptOperatorsEnum): boolean {
            return ops.needsParentheses(op, parentExpressionType, locationInParentExpression);
        };
        return _ctx;
    }
    
    generateGetter(codeGenerator: jsGenerator.JsGenerator, parentExpressionType: ops.JavascriptOperatorsEnum, locationInParentExpression: ops.Location, astContext: astTypes.AstNode): boolean {
        if(!this._generateGetter) return false;
        var ctx = <GetterGeneratorContext>this._addParenthesesPropertiesToCodeGeneratorContext(this._createCodeGeneratorContext(codeGenerator, astContext), parentExpressionType, locationInParentExpression);
        this._generateGetter(ctx);
        return true;
    }
    
    generateSetter(valueToBeSet: astTypes.ExpressionNode, codeGenerator: jsGenerator.JsGenerator, astContext: astTypes.AstNode): boolean {
        if(!this._generateSetter) return false;
        var ctx = <SetterGeneratorContext>this._createCodeGeneratorContext(codeGenerator, astContext);
        ctx.valueToBeSet = valueToBeSet;
        ctx.generateValueToBeSet = function() {
            ctx.jsGenerator.generateExpression(valueToBeSet);
        };
        this._generateSetter(ctx);
        return true;
    }
    
    generateInvocation(args: Array<astTypes.ExpressionNode>, codeGenerator: jsGenerator.JsGenerator, parentExpressionType: ops.JavascriptOperatorsEnum, locationInParentExpression: ops.Location, astContext: astTypes.AstNode): boolean {
        if(!this._generateInvocation) return false;
        var ctx = <InvocationGeneratorContext>this._addParenthesesPropertiesToCodeGeneratorContext(this._createCodeGeneratorContext(codeGenerator, astContext), parentExpressionType, locationInParentExpression);
        ctx.args = args;
        ctx.generateArgumentsList = function() {
            _.each(args, (arg, i, args) => {
                if(i) ctx.jsGenerator.print(', ');
                ctx.jsGenerator.generateExpression(arg, OpEnum.COMMA, ops.Location.N_A);
            });
        };
        this._generateInvocation(ctx);
        return true;
    }
}
