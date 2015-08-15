/// <reference path="../../../typings/all.d.ts" />
"use strict";

/**
 * Validates a bitfield against some rules: certain bits must always be set and certain bits can never be set.
 * If any of the bits set in mustBeSet are not set in flags, the bitfield is invalid.
 * If any of the bits set in mustBeUnset are set in flags, the bitfield is invalid.
 * Otherwise the bitfield is considered valid.
 * 
 * validateFlags(x, 0, 0) will return true for any value of x.
 * 
 * @param flags the bitfield to be validated
 * @param mustBeSet
 * @param mustBeUnset
 * @returns {boolean} True if bitfield is valid; false otherwise.
 */
export function validateFlags(flags: number, mustBeSet?: number, mustBeUnset?: number): boolean {
    return !!((~flags & mustBeSet) || (flags & mustBeUnset));
}

export function flagsSubsetIs(flags: number, subset: number, valueOfSubset: number): boolean {
    return (flags & subset) === (valueOfSubset & subset);
}

/**
 * Set or unsets the value of a bit or bits in a bitfield based on a boolean value.
 * If value is truthy, the bits are set to 1.
 * If value is falsy, the bits are set to 0.
 * @param bitfield bitfield to be modified and returned.
 * @param bits Set of bits that should be modified.  Is itself a bitfield, where each bit that's 1 will be modified and
 * all others will be left untouched.
 * @param value Whether or not to set or unset the bits.
 * @returns {number} The modified bitfield
 */
export function changeFlags(bitfield: number, bits: number, value: boolean): number {
    var ret = value
        ? bitfield | bits // change the bits to 1
        : bitfield & ~bits; // change the bits to 0
    return ret;
}

/**
 * Returns the result of modifying inputBitfield such that all bits specified in bitsToCopy have the values from
 * sourceBitfield.
 * @param inputBitfield
 * @param sourceBitfield
 * @param bitsToCopy
 */
export function copyFlags(inputBitfield: number, bitsToCopy: number, sourceBitfield: number): number {
    var ret = inputBitfield
            & ~bitsToCopy // set all bits to be copied to zero
            | (sourceBitfield & bitsToCopy); // copy values of selected bits from source
    return ret;
}
