/**
 * WWT Math Compatibility Layer
 * 
 * Provides conversion utilities between WWT's legacy math types
 * (Vector3d, Matrix3d) and Babylon.js types (Vector3, Matrix).
 * 
 * This allows gradual migration from custom math implementations
 * to Babylon.js while maintaining compatibility with the existing
 * 2D engine.
 */

import { Vector3, Matrix } from '@babylonjs/core/Maths';

/**
 * WWT's legacy Vector3d interface (from engine package)
 */
export interface WWTVector3d {
    x: number;
    y: number;
    z: number;
}

/**
 * WWT's legacy Matrix3d interface (from engine package)
 */
export interface WWTMatrix3d {
    _m11: number;
    _m12: number;
    _m13: number;
    _m14: number;
    _m21: number;
    _m22: number;
    _m23: number;
    _m24: number;
    _m31: number;
    _m32: number;
    _m33: number;
    _m34: number;
    _offsetX: number;
    _offsetY: number;
    _offsetZ: number;
    _m44: number;
}

/**
 * Converts WWT Vector3d to Babylon.js Vector3
 * 
 * @param wwtVec - WWT Vector3d object
 * @returns Babylon.js Vector3
 * 
 * @example
 * ```typescript
 * import { Vector3d } from '@wwtelescope/engine';
 * 
 * const wwtVec = Vector3d.create(1, 2, 3);
 * const babylonVec = wwtToBabylon(wwtVec);
 * ```
 */
export function wwtToBabylon(wwtVec: WWTVector3d): Vector3 {
    return new Vector3(wwtVec.x, wwtVec.y, wwtVec.z);
}

/**
 * Converts Babylon.js Vector3 to WWT Vector3d-compatible object
 * 
 * @param babylonVec - Babylon.js Vector3
 * @returns WWT Vector3d-compatible object
 * 
 * @example
 * ```typescript
 * import { Vector3 } from '@babylonjs/core/Maths';
 * 
 * const babylonVec = new Vector3(1, 2, 3);
 * const wwtVec = babylonToWWT(babylonVec);
 * ```
 */
export function babylonToWWT(babylonVec: Vector3): WWTVector3d {
    return {
        x: babylonVec.x,
        y: babylonVec.y,
        z: babylonVec.z,
    };
}

/**
 * Converts WWT Matrix3d to Babylon.js Matrix
 * 
 * WWT uses row-major format, Babylon.js uses column-major (WebGL standard).
 * This function handles the conversion.
 * 
 * @param wwtMat - WWT Matrix3d object
 * @returns Babylon.js Matrix
 */
export function wwtMatrixToBabylon(wwtMat: WWTMatrix3d): Matrix {
    // WWT Matrix3d is row-major 4x4:
    // [ m11 m12 m13 m14 ]
    // [ m21 m22 m23 m24 ]
    // [ m31 m32 m33 m34 ]
    // [ offsetX offsetY offsetZ m44 ]
    //
    // Babylon.js Matrix.FromValues expects column-major:
    // [ m11 m21 m31 m41 ]
    // [ m12 m22 m32 m42 ]
    // [ m13 m23 m33 m43 ]
    // [ m14 m24 m34 m44 ]

    return Matrix.FromValues(
        wwtMat._m11, wwtMat._m21, wwtMat._m31, wwtMat._offsetX,
        wwtMat._m12, wwtMat._m22, wwtMat._m32, wwtMat._offsetY,
        wwtMat._m13, wwtMat._m23, wwtMat._m33, wwtMat._offsetZ,
        wwtMat._m14, wwtMat._m24, wwtMat._m34, wwtMat._m44
    );
}

/**
 * Converts Babylon.js Matrix to WWT Matrix3d-compatible object
 * 
 * @param babylonMat - Babylon.js Matrix
 * @returns WWT Matrix3d-compatible object
 */
export function babylonMatrixToWWT(babylonMat: Matrix): WWTMatrix3d {
    const m = babylonMat.m; // Float32Array in column-major order

    // Convert from column-major to row-major
    return {
        _m11: m[0], _m12: m[4], _m13: m[8], _m14: m[12],
        _m21: m[1], _m22: m[5], _m23: m[9], _m24: m[13],
        _m31: m[2], _m32: m[6], _m33: m[10], _m34: m[14],
        _offsetX: m[3],
        _offsetY: m[7],
        _offsetZ: m[11],
        _m44: m[15],
    };
}

/**
 * Copies coordinates from WWT Vector3d to Babylon.js Vector3 (mutating)
 * 
 * More efficient than creating new objects when you already have a Vector3
 * 
 * @param wwtVec - Source WWT Vector3d
 * @param babylonVec - Target Babylon.js Vector3 (will be modified)
 */
export function copyWWTToBabylon(wwtVec: WWTVector3d, babylonVec: Vector3): void {
    babylonVec.x = wwtVec.x;
    babylonVec.y = wwtVec.y;
    babylonVec.z = wwtVec.z;
}

/**
 * Copies coordinates from Babylon.js Vector3 to WWT Vector3d (mutating)
 * 
 * @param babylonVec - Source Babylon.js Vector3
 * @param wwtVec - Target WWT Vector3d (will be modified)
 */
export function copyBabylonToWWT(babylonVec: Vector3, wwtVec: WWTVector3d): void {
    wwtVec.x = babylonVec.x;
    wwtVec.y = babylonVec.y;
    wwtVec.z = babylonVec.z;
}

/**
 * Batch converts an array of WWT Vector3d objects to Babylon.js Vector3 array
 * 
 * @param wwtVecs - Array of WWT Vector3d objects
 * @returns Array of Babylon.js Vector3 objects
 */
export function batchWWTToBabylon(wwtVecs: WWTVector3d[]): Vector3[] {
    return wwtVecs.map(v => new Vector3(v.x, v.y, v.z));
}

/**
 * Batch converts an array of Babylon.js Vector3 to WWT Vector3d array
 * 
 * @param babylonVecs - Array of Babylon.js Vector3 objects
 * @returns Array of WWT Vector3d-compatible objects
 */
export function batchBabylonToWWT(babylonVecs: Vector3[]): WWTVector3d[] {
    return babylonVecs.map(v => ({ x: v.x, y: v.y, z: v.z }));
}
