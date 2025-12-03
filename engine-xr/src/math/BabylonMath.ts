/**
 * Babylon.js Math Re-exports
 * 
 * Central location for all Babylon.js math imports used in engine-xr.
 * This makes it easier to upgrade Babylon.js versions and manage dependencies.
 */

export {
    Vector2,
    Vector3,
    Vector4,
    Matrix,
    Quaternion,
    Color3,
    Color4,
    Plane,
    Angle,
    Arc2,
    Axis,
    BezierCurve,
    Path2,
    Path3D,
    Curve3,
} from '@babylonjs/core/Maths';

export {
    Space,
} from '@babylonjs/core/Maths/math.axis';

/**
 * Math constants with better precision than WWT's legacy constants
 */
export const MathConstants = {
    /** Degrees to radians: π / 180 */
    DEG_TO_RAD: Math.PI / 180,

    /** Radians to degrees: 180 / π */
    RAD_TO_DEG: 180 / Math.PI,

    /** Two PI (full circle) */
    TWO_PI: Math.PI * 2,

    /** Half PI (90 degrees) */
    HALF_PI: Math.PI / 2,

    /** Small epsilon for floating point comparisons */
    EPSILON: 0.000001,
};
