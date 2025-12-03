/**
 * Astronomical Math Utilities using Babylon.js
 * 
 * Provides astronomical coordinate transformations and spherical
 * geometry operations using Babylon.js math primitives.
 * 
 * These functions replace some of the functionality in WWT's
 * double3d.js and coordinates.js with better precision.
 */

import { Vector2, Vector3 } from '@babylonjs/core/Maths';
import { MathConstants } from './BabylonMath';

/**
 * Converts geographic coordinates (latitude, longitude) to 3D Cartesian
 * 
 * @param lat - Latitude in degrees
 * @param lng - Longitude in degrees
 * @param radius - Sphere radius (default 1.0)
 * @returns 3D Cartesian vector
 * 
 * @example
 * ```typescript
 * // Convert Earth coordinates to 3D
 * const vec = geoTo3D(40.7128, -74.0060); // New York City
 * ```
 */
export function geoTo3D(lat: number, lng: number, radius = 1.0): Vector3 {
    const latRad = lat * MathConstants.DEG_TO_RAD;
    const lngRad = lng * MathConstants.DEG_TO_RAD;

    return new Vector3(
        Math.cos(lngRad) * Math.cos(latRad) * radius,
        Math.sin(latRad) * radius,
        Math.sin(lngRad) * Math.cos(latRad) * radius
    );
}

/**
 * Converts 3D Cartesian to spherical coordinates (latitude, longitude)
 * 
 * @param vec - 3D Cartesian vector
 * @returns Vector2 with x=latitude (deg), y=longitude (deg)
 * 
 * @example
 * ```typescript
 * const vec = new Vector3(1, 0, 0);
 * const coords = cartesianToSpherical(vec);
 * console.log(coords.x, coords.y); // 0, 0
 * ```
 */
export function cartesianToSpherical(vec: Vector3): Vector2 {
    const rho = vec.length();

    if (rho === 0) {
        return new Vector2(0, 0);
    }

    const longitude = Math.atan2(vec.z, vec.x);
    const latitude = Math.asin(vec.y / rho);

    const lat = latitude * MathConstants.RAD_TO_DEG;
    let lng = longitude * MathConstants.RAD_TO_DEG;

    // Normalize longitude to [-180, 180]
    if (lng > 180) {
        lng = -180 + (180 - lng);
    }

    return new Vector2(lat, lng);
}

/**
 * Converts Right Ascension/Declination to 3D Cartesian
 * 
 * @param ra - Right Ascension in hours (0-24)
 * @param dec - Declination in degrees (-90 to 90)
 * @param radius - Sphere radius (default 1.0)
 * @returns 3D Cartesian vector
 */
export function raDecTo3D(ra: number, dec: number, radius = 1.0): Vector3 {
    // Convert RA hours to degrees
    const lng = ra * 15; // 24 hours = 360 degrees
    return geoTo3D(dec, lng, radius);
}

/**
 * Converts 3D Cartesian to Right Ascension/Declination
 * 
 * @param vec - 3D Cartesian vector
 * @returns Vector2 with x=RA (hours), y=Dec (degrees)
 */
export function cartesianToRaDec(vec: Vector3): Vector2 {
    const spherical = cartesianToSpherical(vec);
    const ra = (spherical.y / 15 + 24) % 24; // Convert degrees to hours
    const dec = spherical.x;

    return new Vector2(ra, dec);
}

/**
 * Spherical linear interpolation between two vectors
 * 
 * Better than Vector3.Lerp for unit vectors on a sphere because
 * it maintains constant angular velocity.
 * 
 * @param v1 - Start vector (should be normalized)
 * @param v2 - End vector (should be normalized)
 * @param t - Interpolation factor (0-1)
 * @returns Interpolated vector
 */
export function slerp(v1: Vector3, v2: Vector3, t: number): Vector3 {
    const dot = Vector3.Dot(v1, v2);

    // If vectors are very close, use linear interpolation
    if (dot > 0.9995) {
        return Vector3.Lerp(v1, v2, t).normalize();
    }

    // Clamp dot product to avoid numerical errors
    const clampedDot = Math.max(-1, Math.min(1, dot));
    const theta = Math.acos(clampedDot) * t;

    const relative = v2.subtract(v1.scale(clampedDot)).normalize();

    return v1.scale(Math.cos(theta)).add(relative.scale(Math.sin(theta)));
}

/**
 * Great circle distance between two points on a sphere
 * 
 * @param lat1 - First point latitude (degrees)
 * @param lng1 - First point longitude (degrees)
 * @param lat2 - Second point latitude (degrees)
 * @param lng2 - Second point longitude (degrees)
 * @returns Angular distance in degrees
 */
export function greatCircleDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const p1 = geoTo3D(lat1, lng1);
    const p2 = geoTo3D(lat2, lng2);

    const dot = Vector3.Dot(p1, p2);
    const clampedDot = Math.max(-1, Math.min(1, dot));

    return Math.acos(clampedDot) * MathConstants.RAD_TO_DEG;
}

/**
 * Computes the midpoint of two positions on a sphere
 * 
 * Returns the point on the great circle halfway between two points
 * 
 * @param lat1 - First point latitude (degrees)
 * @param lng1 - First point longitude (degrees)
 * @param lat2 - Second point latitude (degrees)
 * @param lng2 - Second point longitude (degrees)
 * @returns Vector2 with x=latitude, y=longitude of midpoint
 */
export function sphericalMidpoint(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): Vector2 {
    const p1 = geoTo3D(lat1, lng1);
    const p2 = geoTo3D(lat2, lng2);

    const midpoint = p1.add(p2).scale(0.5).normalize();

    return cartesianToSpherical(midpoint);
}

/**
 * Projects a 3D point onto the XY plane (for 2D rendering)
 * 
 * @param vec - 3D vector
 * @returns 2D vector (x, y components)
 */
export function projectToXY(vec: Vector3): Vector2 {
    return new Vector2(vec.x, vec.y);
}

/**
 * Projects a 3D point onto the XZ plane
 * 
 * @param vec - 3D vector
 * @returns 2D vector (x, z components)
 */
export function projectToXZ(vec: Vector3): Vector2 {
    return new Vector2(vec.x, vec.z);
}

/**
 * Rotates a vector around the Y axis (vertical/celestial pole)
 * 
 * @param vec - Vector to rotate
 * @param angleDeg - Rotation angle in degrees
 * @returns Rotated vector
 */
export function rotateAroundY(vec: Vector3, angleDeg: number): Vector3 {
    const angleRad = angleDeg * MathConstants.DEG_TO_RAD;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);

    return new Vector3(
        vec.x * cos + vec.z * sin,
        vec.y,
        -vec.x * sin + vec.z * cos
    );
}

/**
 * Computes azimuth and altitude from a 3D direction vector
 * 
 * @param vec - Direction vector
 * @returns Vector2 with x=azimuth (0-360), y=altitude (-90 to 90) in degrees
 */
export function cartesianToAzAlt(vec: Vector3): Vector2 {
    const normalized = vec.normalize();

    const azimuth = (Math.atan2(normalized.x, normalized.z) * MathConstants.RAD_TO_DEG + 360) % 360;
    const altitude = Math.asin(normalized.y) * MathConstants.RAD_TO_DEG;

    return new Vector2(azimuth, altitude);
}

/**
 * Converts azimuth/altitude to 3D direction vector
 * 
 * @param azimuth - Azimuth in degrees (0-360, 0=North)
 * @param altitude - Altitude in degrees (-90 to 90)
 * @returns Unit direction vector
 */
export function azAltTo3D(azimuth: number, altitude: number): Vector3 {
    const azRad = azimuth * MathConstants.DEG_TO_RAD;
    const altRad = altitude * MathConstants.DEG_TO_RAD;

    const cosAlt = Math.cos(altRad);

    return new Vector3(
        Math.sin(azRad) * cosAlt,
        Math.sin(altRad),
        Math.cos(azRad) * cosAlt
    );
}
