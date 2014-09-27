/// <reference path="../../typings/all.d.ts"/>
"use strict";

import _ = require('lodash');

export interface AbstractVariable {
    awaitingJsIdentifierAssignment():boolean;
    getJsIdentifier():string;
    getIdentifier():string;
    getAllocationType():string;
    getAccessType():string;
    getContainingObjectIdentifier():string;
}

export class Variable implements AbstractVariable {

    private _identifier:string;
    private _allocationType:string;
    private _accessType:string;
    private _desiredJsIdentifier:string;
    private _jsIdentifier:string;
    private _containingObjectIdentifier:string;

    /**
     * Enumeration of possible allocationType values.
     * TODO should this be split into allocationType and assignmentType?  Or is that unnecessary complexity/over-engineering?
     */
    private static allocationTypes = ['LOCAL', 'ARGUMENT', 'PROP_ASSIGNMENT', 'NONE'];
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

}
