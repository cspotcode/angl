/// <reference path="../../typings/all.d.ts" />
"use strict";

/**
 * Simple iterator for iterating over the elements of an Array
 */
export class Iter<T> {

    constructor(arr: Array<T>) {
        this._arr = arr;
        this._index = -1;
        this._prev = undefined;
        this._curr = undefined;
        this._next = arr[0];
    }

    next(): T {
        this._index++;
        this._prev = this._curr;
        this._curr = this._arr[this._index];
        this._next = this._arr[this._index + 1];
        return this._curr;
    }
    hasNext(): boolean {
        return this._index < this._arr.length - 1;
    }
    peek(): T {
        return this._next;
    }
    last(): T {
        return this._curr;
    }

    _arr: Array<T>;
    _index: number;
    _prev: T;
    _curr: T;
    _next: T;
}
