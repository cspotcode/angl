/// <reference path="../../typings/all.d.ts"/>
"use strict";

import _ = require('lodash');

import ModuleDescriptor = require('./module-descriptor');
import ModuleExportsType = require('./module-exports-type');

export interface AbstractVariable {
    awaitingJsIdentifierAssignment():boolean;
    getJsIdentifier():string;
    getIdentifier():string;
    getAllocationType():string;
    getAccessType():string;
    getContainingObjectIdentifier():string;
    /**
     * If this variable is provided by a module, returns the ModuleDescriptor for
     * said module.
     * To be "provided" by the module means that the module must be loaded to use this variable.
     * For example, with node's `fs.readFile`, the `readFile` variable is provided by the `fs` module.
     */
    getProvidedByModule():ModuleDescriptor;
}

export class Variable implements AbstractVariable {

    private _identifier:string;
    private _allocationType:string;
    private _accessType:string;
    private _desiredJsIdentifier:string;
    private _jsIdentifier:string;
    private _containingObjectIdentifier:string;
    private _providedByModule: ModuleDescriptor;

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
    
    setProvidedByModule(moduleDescriptor: ModuleDescriptor) { this._providedByModule = moduleDescriptor; }

    getProvidedByModule() { return this._providedByModule; }
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
    
    getContainingObjectIdentifier() {
        if(this._moduleProvidedVariable.getProvidedByModule().exportsType === ModuleExportsType.MULTI) {
            return this._moduleVariable.getJsIdentifier();
        } else {
            return null;
        }
    }
    
    getProvidedByModule() { return null; }
    
}

// A variable that has its own identifier in Angl, but actually maps to the same JS variable as another
// AbstractVariable.
export class LinkedVariable implements AbstractVariable {

    private _linkedToVariable:AbstractVariable;
    private _identifier:string;

    constructor(identifier: string, linkedToVariable:AbstractVariable) {
        this._identifier = identifier;
        this._linkedToVariable = linkedToVariable;
    }

    awaitingJsIdentifierAssignment() { return false; }

    getJsIdentifier():string { return this._linkedToVariable.getJsIdentifier(); }

    getIdentifier():string { return this._identifier; }

    // Linked variables are never allocated because they point at another variable that *is* allocated.
    getAllocationType():string { return 'NONE'; }

    getAccessType():string { return this._linkedToVariable.getAccessType(); }

    getContainingObjectIdentifier():string { return this._linkedToVariable.getContainingObjectIdentifier(); }
    
    getProvidedByModule() { return this._linkedToVariable.getProvidedByModule(); }

}
