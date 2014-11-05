/// <reference path="../../typings/all.d.ts"/>
"use strict";

// Scope class that represents an Angl lexical scope and all the identifiers inside it.

// Remember, the "self" scope is a bit of an exception.
// It is the scope used when no other scope has a given identifier.

import _ = require('lodash');
import Dict = require('collections/dict');
import FastSet = require('collections/fast-set');

import scopeVariable = require('./scope-variable');
import reservedWords = require('./reserved-words');

/**
 * Push all values from the second argument onto the first argument.
 */
var pushArray: <T>(a: Array<T>, b: Array<T>)=>number = Array.prototype.push.apply.bind(Array.prototype.push);

export class AnglScope {

    /**
     * Set of all Variables
     */
    private _variables: FastSet<scopeVariable.AbstractVariable>;
    /**
     * Dictionary mapping Angl identifiers to Variables.  Not all Variables have an Angl identifier.
     */
    /*protected*/ _identifiers: Dict<scopeVariable.AbstractVariable>;
    /**
     * Dictionary mapping Javascript identifiers to Variables.  Not all Variables have a Javascript identifier, though
     * one will eventually have to be assigned to them.
     */
    /*protected*/ _jsIdentifiers: Dict<scopeVariable.AbstractVariable>;
    /**
     * Set containing all Variables that do not have a Javascript identifier.  These identifiers will be assigned to
     * them before Javascript code generation occurs.
     */
    private _unnamedVariables: FastSet<scopeVariable.AbstractVariable>;
    /**
     * Scope that contains this AnglScope.  If an identifier is not found in this scope, it may be found in the parent
     * scope.  Identifiers in this scope will shadow a variable with the same name in the parent scope.
     */
    /*protected*/ _parentScope: AnglScope;
    /**
     * Set of variables from parent scopes that cannot be shadowed by this scope in the generated JS.
     * This will be taken into account when assigning JS identifiers to variables.
     */
    private _unshadowableVariables: FastSet<scopeVariable.AbstractVariable>;
    /**
     * Set of variables that are actually used in the code.
     */
    private _usedVariables: FastSet<scopeVariable.AbstractVariable>;
    /**
     * Set of all scopes that are direct children of this one (scopes for whom _parentScope === this scope)
     */
    private _childScopes: FastSet<AnglScope>;

    /**
     * Can this scope allocate its own local variables in JS?  If not, those will need to be
     * allocated/declared by a parent scope.
     */
    canAllocateOwnLocalVariables: boolean;

    constructor() {
        this._identifiers = new Dict<scopeVariable.AbstractVariable>();
        this._jsIdentifiers = new Dict<scopeVariable.AbstractVariable>();
        this._unnamedVariables = new FastSet<scopeVariable.AbstractVariable>();
        this._variables = new FastSet<scopeVariable.AbstractVariable>();
        this._parentScope = null;
        this._unshadowableVariables = new FastSet<scopeVariable.AbstractVariable>();
        this._childScopes = new FastSet<AnglScope>();
        this._usedVariables = new FastSet<scopeVariable.AbstractVariable>();
    }

    // TODO what types should the identifier and value be?
    // identifier is a string

    // TODO add methods that take the parent scope(s) into account.
    // For example, figure out what identifier a name resolves to including all parent scopes.
    // Adding an identifier, throwing an exception if it overrides anything in a parent scope.
    // Getting all identifiers visible in this scope, including ones from parent scopes
    //   (unless they've been covered up by identical names in this scope).

    // TODO add ability to add identifiers for which the name doesn't matter?
    // These identifiers can be assigned names after the scope is done being created.
    // At that time, it's possible to assign names without causing conflicts.
    // Alternatively, assign names right away and rename if necessary.
    
    /**
     * adds an identifier with the given name, throwing an exception if it already exists
     */
    addVariable(variable:scopeVariable.AbstractVariable) {
        var identifier = variable.getIdentifier();

        // Check that we don't have name conflicts
        if(identifier !== null && this.hasIdentifier(identifier)) throw new Error('Scope already has an identifier with the name "' + identifier + '"');
        this._addVariable(variable);
    }

    /**
     * Internal method for adding variables
     */
    _addVariable(variable:scopeVariable.AbstractVariable) {
        var identifier = variable.getIdentifier();
        var jsIdentifier = variable.getJsIdentifier();

        // Add variable to our internal data structures
        this._variables.add(variable);
        if(identifier !== null) this._identifiers.set(identifier, variable);
        if(jsIdentifier === null) {
            this._unnamedVariables.add(variable);
        } else {
            this._jsIdentifiers.set(jsIdentifier, variable);
        }
    }

    /**
     * returns value for the identifier with the given name, undefined if it doesn't exist
      */
    getVariableByIdentifier(identifier:string):scopeVariable.AbstractVariable {
        return this._identifiers.get(identifier);
    }

    /**
     * returns value for the identifier with the given name in this or any parent scope, undefined if it doesn't exist
     */
    getVariableByIdentifierInChain(identifier:string):scopeVariable.AbstractVariable {
        return this._identifiers.get(identifier) || (this._parentScope && this._parentScope.getVariableByIdentifierInChain(identifier));
    }

    /**
     * returns true or false if identifier with given name exists or doesn't exist
     */
    hasIdentifier(identifier:string) {
        return this._identifiers.has(identifier);
    }

    hasIdentifierInChain(identifier:string) {
        return this.hasIdentifier(identifier) || !!(this._parentScope && this._parentScope.hasIdentifierInChain(identifier));
    }

    /**
     * returns true or false if variable is in this scope (and not in a parent scope)
     * @param variable
     * @returns {boolean}
     */
    hasVariable(variable: scopeVariable.AbstractVariable) {
        return this._variables.contains(variable);
    }

    // sets identifier with given name and value, replacing previous one with that name if it exists
/*    setIdentifier(name, value) {
        this._identifiers.set(name, value);
    };*/

    /**
     * removes identifier with the given name, returning true if it was removed, false if it didn't exist
     */
    removeVariableByIdentifier(identifier:string):boolean {
        var variable = this.getVariableByIdentifier(identifier);
        if(variable) {
            this.removeVariable(variable);
            return true;
        } else {
            return false;
        }
    }

    removeVariable(variable:scopeVariable.AbstractVariable):boolean {
        var ret = this._variables.delete(variable);
        if(ret) {
            var jsIdentifier = variable.getJsIdentifier()
              , identifier = variable.getIdentifier()
              ;
            identifier !== null && this._identifiers.delete(identifier);
            jsIdentifier !== null && this._jsIdentifiers.delete(jsIdentifier);
            this._unnamedVariables.delete(variable);
        }
        return ret;
    }

    /**
     * Returns an array of all Variables
     */
    getVariablesArray():scopeVariable.AbstractVariable[] { return this._variables.toArray(); }
    
    setParentScope(parentAnglScope: AnglScope) {
        if(this._parentScope) {
            this._parentScope._childScopes.delete(this);
        }
        this._parentScope = parentAnglScope;
        this._parentScope._childScopes.add(this);
    }

    getParentScope(): AnglScope {
        return this._parentScope;
    }

    /**
     * Converts all unnamed identifiers to regular identifiers by assigning them names
     */
    assignJsIdentifiers():void {
        var unnamedVariables = this._unnamedVariables.toArray();
        // Create a set of all the identifier names we cannot use.
        var forbiddenNames = new FastSet();
        // Add all the identifier names we cannot shadow.
        this._unshadowableVariables.forEach((variable) => {
            // Sanity check that this variable is capable of being shadowed
            if(variable.getAccessType() !== scopeVariable.AccessType.BARE) {
                throw new Error('Variable should not be shadowed, yet it is not possible to shadow this variable.  This probably indicates a bug elsewhere in the compiler.');
            }
            // Sanity check that this variable has been assigned a JS identifier.  Otherwise there is
            // nothing for us to avoid shadowing.
            if(variable.awaitingJsIdentifierAssignment() || !variable.getJsIdentifier()) {
                throw new Error('Variable should not be shadowed, yet it has not been assigned a JS identifier.');
            }
            forbiddenNames.add(variable.getJsIdentifier());
        });
        // Add names that are not allowed because they are TypeScript / JavaScript keywords
        forbiddenNames.addEach(reservedWords.typeScriptReservedWords);
        forbiddenNames.addEach(reservedWords.javaScriptReservedWords);
        
        _.each(unnamedVariables, (variable:scopeVariable.Variable) => {
            // Some variables might be unnamed but don't want us to assign them a name.
            if(!variable.awaitingJsIdentifierAssignment()) return;
            // Remove variable from self.  Will be re-added once we've assigned a JS name
            this.removeVariable(variable);
            var namePrefix = variable.getDesiredJsIdentifier() || '__a';
            var nameSuffix = '';
            // While the name is already in use, create a new name by using a different suffix
            var uid = 2;
            while(this._hasJsIdentifier(namePrefix + nameSuffix) || forbiddenNames.contains(namePrefix + nameSuffix)) {
                nameSuffix = '' + uid;
                uid++;
            }
            // Found a unique name!  Assign it.
            var name = namePrefix + nameSuffix;
            variable.setJsIdentifier(name);
            // Re-add variable to self
            this.addVariable(variable);
        });
    }

    _hasJsIdentifier(identifier:string):boolean {
        return this._jsIdentifiers.has(identifier);
    }

    /**
     * Remember not to shadow the given variable in the generated JS.
     * @param variable A variable from a parent scope that must not be shadowed by this scope.
     */
    doNotShadow(variable: scopeVariable.AbstractVariable) {
        this._unshadowableVariables.add(variable);
    }

    /**
     * Returns an array of all variables that must be allocated by/in this scope.  Some variables
     * do not need to be allocated at all, and sometimes a scope must allocate variables on behalf
     * of a child scope.
     * Imports (`var mod = require('mod')` or `import mod = require('mod')` are excluded; they are handled
     * separately.
     */
    getVariablesThatMustBeAllocatedInThisScope(): Array<scopeVariable.AbstractVariable> {
        if(!this.canAllocateOwnLocalVariables) return [];
        var vars: Array<scopeVariable.AbstractVariable> = [];
        // Search all child scopes, recursive-descent, for variables that must be allocated by
        // this scope, because the child scope, for whatever reason, can't allocate its
        // own variables.
        var visitedScopes: Array<AnglScope> = [this];
        var scope;
        while(scope = visitedScopes.shift()) {
            // Is this a child scope that can allocate its own local variables?  If so, skip it.
            if(scope !== this && scope.canAllocateOwnLocalVariables) continue;
            pushArray(
                vars,
                _.filter(scope.getVariablesArray(), (variable: scopeVariable.AbstractVariable) => variable.getAllocationType() === scopeVariable.AllocationType.LOCAL)
            );
            pushArray(visitedScopes, scope._childScopes.toArray());
        }
        return vars;
    }

    setIdentifierIsUsed(identifier: string, isUsed: boolean = true) {
        var variable = this.getVariableByIdentifier(identifier);
        if(!variable) throw new Error('Scope does not have variable with identifier ' + JSON.stringify(identifier));
        this.setVariableIsUsed(variable, isUsed);
    }
    
    setIdentifierInChainIsUsed(identifier: string, isUsed: boolean = true) {
        var variable = this.getVariableByIdentifierInChain(identifier);
        if(!variable) throw new Error('Scope chain does not have variable with identifier ' + JSON.stringify(identifier));
        this.setVariableIsUsed(variable, isUsed);
    }
    
    setVariableIsUsed(variable: scopeVariable.AbstractVariable, isUsed: boolean = true) {
        // Sanity check that we actually own this variable
        if(!this.hasVariable(variable)) throw new Error('Variable is not from this scope.');
        if(isUsed) this._usedVariables.add(variable);
        else this._usedVariables.remove(variable);
    }
    
    setVariableInChainIsUsed(variable: scopeVariable.AbstractVariable, isUsed: boolean = true) {
        var scopeWithVariable = this;
        while(!scopeWithVariable.hasVariable(variable)) {
            scopeWithVariable = scopeWithVariable.getParentScope();
            if(!scopeWithVariable) throw new Error('Variable is not from any scope in this scope\'s chain.');
        }
        scopeWithVariable.setVariableIsUsed(variable);
    }
    
    getVariableIsUsed(variable: scopeVariable.AbstractVariable): boolean {
        return this._usedVariables.has(variable);
    }
    
    getIdentifierIsUsed(identifier: string): boolean {
        var variable = this.getVariableByIdentifier(identifier);
        if(!variable) throw new Error('Scope does not have a variable with identifier ' + JSON.stringify(identifier));
        return this._usedVariables.has(variable);
    }
    
    /**
     * Returns an array of all used variables (variables that are actually referenced in the code)
     */
    getUsedVariablesArray(): Array<scopeVariable.AbstractVariable> { return this._usedVariables.toArray(); }
}

AnglScope.prototype.canAllocateOwnLocalVariables = true;


/**
 * Scope created for each Angl with() {} block.
 * Angl's `self` and `other` variables are different within a with() {} block.
 */
export class WithScope extends AnglScope {

    getVariableByIdentifier(identifier:string) { return super.getVariableByIdentifier(identifier) || this._parentScope.getVariableByIdentifier(identifier); }

    hasIdentifier(identifier:string) { return super.hasIdentifier(identifier) || this._parentScope.hasIdentifier(identifier); }

    addVariable(variable:scopeVariable.AbstractVariable) {
        var identifier = variable.getIdentifier();

        // Check that we don't have name conflicts.
        // `self` and `other` are allowed to override `self` and `other` from the parent scope.
        // For everything else, overriding is not allowed.
        if(identifier !== null) {
            if(_.contains(['self', 'other'], identifier)
              ? this._identifiers.has(identifier)
              : this.hasIdentifier(identifier)
            ) {
                throw new Error('Scope already has an identifier with the name "' + identifier + '"');
            }
        }
        this._addVariable(variable);
    }

    _hasJsIdentifier(identifier:string):boolean {
        return this._jsIdentifiers.has(identifier) || this._parentScope._hasJsIdentifier(identifier);
    }

}

WithScope.prototype.canAllocateOwnLocalVariables = false;


// An identifier that exists in an Angl scope, will refer to a variable in memory at runtime, and knows how that
// variable can be accessed via JavaScript code at runtime.
export interface Identifier {
    getJsExpression():string;
}


// Types of identifiers:
// script const
// other const (these are the same???)
//    consts can't be an lvalue
// function argument
// local variables
// value is a script, const value, local variable

/*
  An Angl value takes the form:
  {
    type: 'constant' || 'localVar' || 'argument',

  }
 */


