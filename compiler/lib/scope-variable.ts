/// <reference path="../../typings/all.d.ts"/>
"use strict";

import _ = require('lodash');

import ModuleDescriptor = require('./module-descriptor');
import ModuleExportsType = require('./module-exports-type');
import astTypes = require('./ast-types');
import operators = require('./operator-precedence-and-associativity');
import jsGenerator = require('./main');

export interface AbstractVariable {
    awaitingJsIdentifierAssignment():boolean;
    getJsIdentifier():string;
    getIdentifier():string;
    getAllocationType():string;
    getAccessType():string;
    /**
     * Returns the identifier of the object which this variable is a property of.
     * Some variables are actually properties of another object.
     * E.g. `foo.bar`: this method returns "foo"
     * Otherwise returns null.
     */
    getContainingObjectIdentifier(): string;
    /**
     * Returns the variable representing the object which this variable is a property of.
     * Some variables are actually properties of another object. (e.g. `foo.bar`: `bar`
     * is a property of another variable `foo`)  If that other object (`foo`)
     * is represented by an instance of AbstractVariable, this method returns that AbstractVariable.
     * 
     * If this variable is not a property of another object, or if the containing object is
     * not represented by an instance of AbstractVariable, this method returns null.
     * 
     * See also: getContainingObjectIdentifier
     */
    getContainingObjectVariable(): AbstractVariable;
    /**
     * If this variable is provided by a module, returns the ModuleDescriptor for
     * said module.
     * To be "provided" by the module means that the module must be loaded to use this variable.
     * For example, with node's `fs.readFile`, the `readFile` variable is provided by the `fs` module.
     */
    getProvidedByModule():ModuleDescriptor;
    /**
     * True if this variable, when invoked as a function, will need its `this` value bound to the
     * calling scope's `self` value.
     *   `theVariable.call(this, arg0, arg1, ...)`
     * If false, the `this` value does not need to be set, and the function can be invoked with less overhead.
     *   `theVariable(arg0, arg1, ...)`
     */
    getUsesThisBinding():boolean;
    /**
     * Called by the JS code generator whenever the generated code must invoke this variable as a function.
     * This method can:
     * * return true after generating the function invocation code itself.
     * * return false, in which case default function invocation code will be generated.
     * @param args
     * @param opts
     * @returns {boolean}
     */
    generateInvocation(args: Array<astTypes.ExpressionNode>, codeGenerator: jsGenerator.JsGenerator, parentExpressionType: operators.JavascriptOperatorsEnum, locationInParentExpression: operators.Location, astContext: astTypes.AstNode): boolean;
    /**
     * Called by the JS code generator whenever the generated code must get the value of this variable.
     * This method can:
     * * return true after generating the getter expression.
     * * return false, in which case a default getter expression will be generated.
     * @param opts
     * @returns {boolean}
     */
    generateGetter(codeGenerator: jsGenerator.JsGenerator, parentExpressionType: operators.JavascriptOperatorsEnum, locationInParentExpression: operators.Location, astContext: astTypes.AstNode): boolean;
    /**
     * Called by the JS code generator whenever the generated code must set the value of this variable.
     * This method can:
     * * return true after generating the setting code.
     * * return false, in which case a default setting code will be generated.
     * @param opts
     * @returns {boolean}
     */
    generateSetter(valueToBeSet: astTypes.ExpressionNode, codeGenerator: jsGenerator.JsGenerator, astContext: astTypes.AstNode): boolean;
}

/**
 * Basic implementation of AbstractVariable.
 */
export class Variable implements AbstractVariable {

    private _identifier:string;
    private _allocationType:string;
    private _accessType:string;
    private _desiredJsIdentifier:string;
    private _jsIdentifier:string;
    private _containingObjectIdentifier:string;
    private _providedByModule: ModuleDescriptor;
    private _usesThisBinding: boolean;

    /**
     * Enumeration of possible allocationType values.
     * TODO should this be split into allocationType and assignmentType?  Or is that unnecessary complexity/over-engineering?
     */
    private static allocationTypes = ['LOCAL', 'ARGUMENT', 'PROP_ASSIGNMENT', 'IMPORT', 'NONE'];
    /**
     * Enumeration of possible accessType values.
     */
    private static accessTypes = ['BARE', 'PROP_ACCESS'];

    constructor(identifier:string = null, allocationType:string = 'LOCAL', accessType:string = 'BARE') {
        if(!_.contains(Variable.allocationTypes, allocationType)) throw new Error('Invalid Variable allocationType "' + allocationType + '"');
        if(!_.contains(Variable.accessTypes, accessType)) throw new Error('Invalid Variable accessType"' + accessType + '"');

        this._identifier = identifier;
        this._jsIdentifier = identifier;
        this._desiredJsIdentifier = null;
        this._allocationType = allocationType;
        this._accessType = accessType;
        this._containingObjectIdentifier = null;
        this._providedByModule = null;
        this._usesThisBinding = true;
    }

    awaitingJsIdentifierAssignment() { return !this._jsIdentifier; }

    /**
     * Sets the identifier that this variable would like to have in the generated JavaScript.
     * It may or may not get this identifier, depending on if their are identifier collisions.
     * @param desiredIdentifier
     */
    setDesiredJsIdentifier(desiredIdentifier:string) { this._desiredJsIdentifier = desiredIdentifier; }

    getDesiredJsIdentifier():string { return this._desiredJsIdentifier; }

    /**
     * Sets the identifier that this variable will have in the generated JavaScript.
     * @param jsIdentifier
     */
    setJsIdentifier(jsIdentifier:string) { this._jsIdentifier = jsIdentifier; }

    getJsIdentifier():string { return this._jsIdentifier; }

    /**
     * Sets the identifier that this variable has in Angl.
     * @param identifier
     */
    setIdentifier(identifier:string) { this._identifier = identifier; }

    getIdentifier():string { return this._identifier; }

    getAllocationType():string { return this._allocationType; }

    getAccessType():string { return this._accessType; }

    /**
     * Sets the identifier of the containing object (the object that contains this variable).
     * For a PROP-ACCESS variable, the variable is actually a property of another object.
     * It is accessed in JavaScript using "containingObject.variableIdentifier"
     * @param identifier
     */
    setContainingObjectIdentifier(identifier:string) { this._containingObjectIdentifier = identifier; }

    getContainingObjectIdentifier():string { return this._containingObjectIdentifier; }
    
    getContainingObjectVariable() { return null; }
    
    setProvidedByModule(moduleDescriptor: ModuleDescriptor) { this._providedByModule = moduleDescriptor; }

    getProvidedByModule() { return this._providedByModule; }

    getUsesThisBinding() { return this._usesThisBinding; }

    setUsesThisBinding(usesThisBinding: boolean) { this._usesThisBinding = usesThisBinding; }

    generateInvocation(args: Array<astTypes.ExpressionNode>, codeGenerator: jsGenerator.JsGenerator, parentExpressionType: operators.JavascriptOperatorsEnum, locationInParentExpression: operators.Location, astContext: astTypes.AstNode): boolean {
        return false;
    }
    
    generateGetter(codeGenerator: jsGenerator.JsGenerator, parentExpressionType: operators.JavascriptOperatorsEnum, locationInParentExpression: operators.Location, astContext: astTypes.AstNode): boolean {
        return false;
    }

    generateSetter(valueToBeSet: astTypes.ExpressionNode, codeGenerator: jsGenerator.JsGenerator, astContext: astTypes.AstNode): boolean {
        return false;
    }

}

/**
 * A variable created in a File scope that proxies to the corresponding variable in a module.
 * For example, if module "foo-module" exposes a property "bar" (for our purposes, module properties
 * == module variables) and is loaded as follows:
 *     `var foo = require('foo');`
 * the ProxyToModuleVariable for bar would generate code that looks like:
 *     `foo.bar`
 * It knows the local variable for that module (foo) so it can generate the correct code.  This local
 * variable (foo) can potentially be different in different files, which is why ProxyToModuleVariable
 * instances are created.
 */
export class ProxyToModuleProvidedVariable implements AbstractVariable {
    private _moduleVariable: AbstractVariable;
    private _moduleProvidedVariable: AbstractVariable;
    
    constructor(moduleProvidedVariable: AbstractVariable, moduleVariable: AbstractVariable) {
        this._moduleVariable = moduleVariable;
        this._moduleProvidedVariable = moduleProvidedVariable;
        // Sanity-check that we know the export type of the module providing this variable (SINGLE or MULTI).
        // UNKNOWN is not allowed.
        if(this._moduleProvidedVariable.getProvidedByModule().exportsType === ModuleExportsType.UNKNOWN)
            throw new Error('Cannot create proxyToModuleProvidedVariable for a module with exportsType UNKNOWN.');
    }
    
    awaitingJsIdentifierAssignment() { return false; }
    
    getJsIdentifier() {
        if(this._moduleProvidedVariable.getProvidedByModule().exportsType === ModuleExportsType.MULTI) {
            return this._moduleProvidedVariable.getJsIdentifier();
        } else {
            return this._moduleVariable.getJsIdentifier();
        }
    }
    
    getIdentifier() {
        if(this._moduleProvidedVariable.getProvidedByModule().exportsType === ModuleExportsType.MULTI) {
            return this._moduleProvidedVariable.getIdentifier();
        } else {
            return this._moduleVariable.getIdentifier();
        }
    }
    
    getAllocationType() { return 'NONE'; }
    
    getAccessType() {
        if(this._moduleProvidedVariable.getProvidedByModule().exportsType === ModuleExportsType.MULTI) {
            return 'PROP_ACCESS';
        } else {
            return 'BARE';
        }
        
    }
    
    private _isPropertyOfModuleVariable(): boolean {
        return this._moduleProvidedVariable.getProvidedByModule().exportsType === ModuleExportsType.MULTI;
    }
    
    getContainingObjectIdentifier() {
        if(this._isPropertyOfModuleVariable()) {
            return this._moduleVariable.getJsIdentifier();
        } else {
            return null;
        }
    }
    
    getContainingObjectVariable() {
        if(this._isPropertyOfModuleVariable()) {
            return this._moduleVariable;
        } else {
            return null;
        }
    }
    
    getProvidedByModule() { return null; }
    
    getUsesThisBinding() { return this._moduleProvidedVariable.getUsesThisBinding(); }
    
    generateGetter(codeGenerator, parentExpressionType, locationInParentExpression, astContext) {
        return this._moduleProvidedVariable.generateGetter(codeGenerator, parentExpressionType, locationInParentExpression, astContext);
    }
    
    generateSetter(valueToSet, codeGenerator, astContext) {
        return this._moduleProvidedVariable.generateSetter(valueToSet, codeGenerator, astContext);
    }
    
    generateInvocation(args, codeGenerator, parentExpressionType, locationInParentExpression, astContext) {
        return this._moduleProvidedVariable.generateInvocation(args, codeGenerator, parentExpressionType, locationInParentExpression, astContext);
    }
    
}
