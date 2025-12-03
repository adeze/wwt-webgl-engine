/**
 * Example: Starfield Generation using Babylon.js Math
 * 
 * Demonstrates how to use engine-xr math utilities to create
 * an astronomical visualization with proper spherical coordinates.
 */

import {
    Vector3,
    raDecTo3D,
    greatCircleDistance,
    slerp,
} from '../index';/**
 * Star data structure
 */
interface Star {
    /** Right Ascension in hours (0-24) */
    ra: number;
    /** Declination in degrees (-90 to 90) */
    dec: number;
    /** Visual magnitude (brightness) */
    magnitude: number;
    /** Star name */
    name?: string;
}

/**
 * Example: Famous stars in Orion constellation
 */
const orionStars: Star[] = [
    { ra: 5.242, dec: -8.202, magnitude: 0.45, name: 'Rigel' },      // β Orionis
    { ra: 5.919, dec: 7.407, magnitude: 0.18, name: 'Betelgeuse' }, // α Orionis
    { ra: 5.604, dec: -1.943, magnitude: 1.70, name: 'Bellatrix' }, // γ Orionis
    { ra: 5.533, dec: -0.299, magnitude: 2.23, name: 'Mintaka' },   // δ Orionis
    { ra: 5.603, dec: -1.202, magnitude: 1.69, name: 'Alnilam' },   // ε Orionis
    { ra: 5.679, dec: -1.943, magnitude: 2.05, name: 'Alnitak' },   // ζ Orionis
];

/**
 * Convert star catalog to 3D positions
 */
export function generateStarPositions(stars: Star[], radius = 100): Vector3[] {
    return stars.map(star => raDecTo3D(star.ra, star.dec, radius));
}

/**
 * Generate a random starfield
 */
export function generateRandomStarfield(count: number, radius = 100): Vector3[] {
    const stars: Vector3[] = [];

    for (let i = 0; i < count; i++) {
        // Random spherical coordinates
        const ra = Math.random() * 24; // 0-24 hours
        const dec = (Math.random() * 180) - 90; // -90 to 90 degrees

        stars.push(raDecTo3D(ra, dec, radius));
    }

    return stars;
}

/**
 * Find stars within a field of view
 */
export function findStarsInFOV(
    stars: Vector3[],
    centerRa: number,
    centerDec: number,
    fovDegrees: number
): Vector3[] {
    return stars.filter(star => {
        // Calculate angular distance from center
        const distance = greatCircleDistance(
            centerDec, centerRa,
            star.y, star.x
        );

        return distance <= fovDegrees / 2;
    });
}

/**
 * Animate camera between two celestial positions
 */
export class CelestialCameraAnimator {
    private startPos: Vector3;
    private endPos: Vector3;
    private duration: number;
    private startTime: number;
    private isAnimating: boolean;

    constructor(
        startRa: number,
        startDec: number,
        endRa: number,
        endDec: number,
        durationMs: number
    ) {
        this.startPos = raDecTo3D(startRa, startDec, 10);
        this.endPos = raDecTo3D(endRa, endDec, 10);
        this.duration = durationMs;
        this.startTime = 0;
        this.isAnimating = false;
    }

    start(): void {
        this.startTime = Date.now();
        this.isAnimating = true;
    }

    update(): Vector3 | null {
        if (!this.isAnimating) {
            return null;
        }

        const elapsed = Date.now() - this.startTime;
        const t = Math.min(elapsed / this.duration, 1.0);

        if (t >= 1.0) {
            this.isAnimating = false;
            return this.endPos;
        }

        // Use spherical interpolation for smooth motion
        return slerp(this.startPos, this.endPos, t);
    }

    get finished(): boolean {
        return !this.isAnimating;
    }
}

/**
 * Example: Animate from Orion to Ursa Major
 */
export function exampleAnimation(): CelestialCameraAnimator {
    // Orion (roughly centered on Betelgeuse)
    const orionRa = 5.919;
    const orionDec = 7.407;

    // Ursa Major (roughly centered on Big Dipper)
    const ursaMajorRa = 11.062;
    const ursaMajorDec = 61.751;

    // 3 second animation
    return new CelestialCameraAnimator(
        orionRa, orionDec,
        ursaMajorRa, ursaMajorDec,
        3000
    );
}

/**
 * Convert magnitude to visual size/brightness
 */
export function magnitudeToSize(magnitude: number): number {
    // Brighter stars (lower magnitude) = larger size
    // Magnitude scale: -1.5 (brightest) to 6 (faintest visible)
    const normalized = Math.max(-1.5, Math.min(6, magnitude));
    return Math.pow(2, (6 - normalized) / 2);
}

/**
 * Example usage in XR scene
 */
export function setupStarfieldExample() {
    // Generate star positions
    const stars = generateStarPositions(orionStars);

    console.log('Generated', stars.length, 'star positions');

    // Create animation
    const animator = exampleAnimation();
    animator.start();

    // Animation loop
    const animate = () => {
        const cameraPos = animator.update();

        if (cameraPos) {
            console.log('Camera at:', cameraPos.toString());

            if (!animator.finished) {
                requestAnimationFrame(animate);
            } else {
                console.log('Animation complete!');
            }
        }
    };

    animate();
}

/**
 * Calculate angular separation between two stars
 */
export function starAngularSeparation(star1: Star, star2: Star): number {
    return greatCircleDistance(
        star1.dec, star1.ra * 15, // Convert RA hours to degrees
        star2.dec, star2.ra * 15
    );
}

/**
 * Example: Find star pairs closer than a given angle
 */
export function findClosePairs(stars: Star[], maxSeparationDeg: number): Array<[Star, Star, number]> {
    const pairs: Array<[Star, Star, number]> = [];

    for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
            const separation = starAngularSeparation(stars[i], stars[j]);

            if (separation <= maxSeparationDeg) {
                pairs.push([stars[i], stars[j], separation]);
            }
        }
    }

    return pairs;
}

// Example usage
if (require.main === module) {
    console.log('=== Starfield Example ===\n');

    // Convert Orion stars to 3D
    const positions = generateStarPositions(orionStars);
    console.log('Star positions in 3D:');
    positions.forEach((pos, i) => {
        console.log(`  ${orionStars[i].name}: ${pos.toString()}`);
    });

    console.log('\n=== Angular Separations ===\n');
    const pairs = findClosePairs(orionStars, 5); // Find stars < 5° apart
    pairs.forEach(([star1, star2, sep]) => {
        console.log(`${star1.name} ↔ ${star2.name}: ${sep.toFixed(2)}°`);
    });
}
