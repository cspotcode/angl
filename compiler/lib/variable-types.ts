/// <reference path="../../typings/all.d.ts" />
"use strict";

export class AbstractVariableType {}

export class VoidType extends AbstractVariableType {}

export class AnyType extends AbstractVariableType {}

export class ClassType extends AbstractVariableType {}

export class ArrayType extends AbstractVariableType {
    constructor(public itemType: AbstractVariableType) {
        super();
    }
}

export class BooleanType extends AbstractVariableType {}

export class NumberType extends AbstractVariableType {}

export class StringType extends AbstractVariableType {}

export class FunctionType extends AbstractVariableType {
    constructor(public argumentTypes: Array<AbstractVariableType>, public returnType: AbstractVariableType) {
        super();
    }
}
