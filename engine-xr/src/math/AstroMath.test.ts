import { describe, it, expect } from 'vitest';
import { Vector3 } from './BabylonMath';
import {
    geoTo3D,
    raDecTo3D,
    slerp,
    greatCircleDistance,
    sphericalMidpoint,
    azAltTo3D
} from './AstroMath';

describe('AstroMath geoTo3D', () => {
    it('should convert equator position correctly', () => {
        const v = geoTo3D(0, 0);  // lat=0, lng=0
        expect(v.x).toBeCloseTo(1, 10);
        expect(v.y).toBeCloseTo(0, 10);
        expect(v.z).toBeCloseTo(0, 10);
    });

    it('should convert north pole correctly', () => {
        const v = geoTo3D(90, 0);  // lat=90, lng=0
        expect(v.x).toBeCloseTo(0, 10);
        expect(v.y).toBeCloseTo(1, 10);
        expect(v.z).toBeCloseTo(0, 10);
    });

    it('should convert south pole correctly', () => {
        const v = geoTo3D(-90, 0);  // lat=-90, lng=0
        expect(v.x).toBeCloseTo(0, 10);
        expect(v.y).toBeCloseTo(-1, 10);
        expect(v.z).toBeCloseTo(0, 10);
    });

    it('should produce unit vectors', () => {
        const v1 = geoTo3D(30, 45);
        expect(v1.length()).toBeCloseTo(1, 10);

        const v2 = geoTo3D(-45, 120);
        expect(v2.length()).toBeCloseTo(1, 10);
    });
}); describe('AstroMath raDecTo3D', () => {
    it('should convert RA=0, Dec=0 correctly', () => {
        const v = raDecTo3D(0, 0);
        expect(v.x).toBeCloseTo(1, 10);
        expect(v.y).toBeCloseTo(0, 10);
        expect(v.z).toBeCloseTo(0, 10);
    });

    it('should convert north celestial pole', () => {
        const v = raDecTo3D(0, 90);
        expect(v.x).toBeCloseTo(0, 10);
        expect(v.y).toBeCloseTo(0, 10);
        expect(v.z).toBeCloseTo(1, 10);
    });

    it('should convert south celestial pole', () => {
        const v = raDecTo3D(0, -90);
        expect(v.x).toBeCloseTo(0, 10);
        expect(v.y).toBeCloseTo(0, 10);
        expect(v.z).toBeCloseTo(-1, 10);
    });

    it('should handle RA wrapping (0-360)', () => {
        const v1 = raDecTo3D(0, 0);
        const v2 = raDecTo3D(360, 0);

        expect(v1.x).toBeCloseTo(v2.x, 10);
        expect(v1.y).toBeCloseTo(v2.y, 10);
        expect(v1.z).toBeCloseTo(v2.z, 10);
    });

    it('should produce unit vectors', () => {
        const v1 = raDecTo3D(100, 45);
        expect(v1.length()).toBeCloseTo(1, 10);

        const v2 = raDecTo3D(250, -30);
        expect(v2.length()).toBeCloseTo(1, 10);
    });
});

describe('AstroMath azAltTo3D', () => {
    it('should convert horizon (alt=0, az=0) correctly', () => {
        const v = azAltTo3D(0, 0);  // North horizon
        expect(v.x).toBeCloseTo(0, 10);
        expect(v.y).toBeCloseTo(0, 10);
        expect(v.z).toBeCloseTo(1, 10);
    });

    it('should convert zenith (alt=90) correctly', () => {
        const v = azAltTo3D(0, 90);  // Straight up
        expect(v.x).toBeCloseTo(0, 10);
        expect(v.y).toBeCloseTo(1, 10);
        expect(v.z).toBeCloseTo(0, 10);
    });

    it('should produce unit vectors', () => {
        const v1 = azAltTo3D(45, 30);
        expect(v1.length()).toBeCloseTo(1, 10);

        const v2 = azAltTo3D(180, 60);
        expect(v2.length()).toBeCloseTo(1, 10);
    });
}); describe('AstroMath slerp', () => {
    it('should return start vector at t=0', () => {
        const start = new Vector3(1, 0, 0);
        const end = new Vector3(0, 1, 0);
        const result = slerp(start, end, 0);

        expect(result.x).toBeCloseTo(1, 10);
        expect(result.y).toBeCloseTo(0, 10);
        expect(result.z).toBeCloseTo(0, 10);
    });

    it('should return end vector at t=1', () => {
        const start = new Vector3(1, 0, 0);
        const end = new Vector3(0, 1, 0);
        const result = slerp(start, end, 1);

        expect(result.x).toBeCloseTo(0, 10);
        expect(result.y).toBeCloseTo(1, 10);
        expect(result.z).toBeCloseTo(0, 10);
    });

    it('should interpolate at t=0.5', () => {
        const start = new Vector3(1, 0, 0);
        const end = new Vector3(0, 1, 0);
        const result = slerp(start, end, 0.5);

        // Should be roughly 45 degrees between x and y axes
        expect(result.x).toBeCloseTo(result.y, 1);
        expect(result.length()).toBeCloseTo(1, 10);
    });

    it('should maintain unit length throughout interpolation', () => {
        const start = new Vector3(1, 0, 0);
        const end = new Vector3(0, 0, 1);

        for (let t = 0; t <= 1; t += 0.1) {
            const result = slerp(start, end, t);
            expect(result.length()).toBeCloseTo(1, 8);
        }
    });

    it('should handle opposite vectors', () => {
        const start = new Vector3(1, 0, 0);
        const end = new Vector3(-1, 0, 0);
        const result = slerp(start, end, 0.5);

        // Should pick perpendicular path
        expect(result.length()).toBeCloseTo(1, 10);
    });
});

describe('AstroMath greatCircleDistance', () => {
    it('should return 0 for identical points', () => {
        expect(greatCircleDistance(0, 0, 0, 0)).toBeCloseTo(0, 10);
    });

    it('should calculate 90 degrees for perpendicular positions', () => {
        // Equator at 0° and North Pole
        expect(greatCircleDistance(0, 0, 90, 0)).toBeCloseTo(90, 10);
    });

    it('should calculate 180 degrees for opposite positions', () => {
        // Opposite sides of equator
        expect(greatCircleDistance(0, 0, 0, 180)).toBeCloseTo(180, 10);
    });

    it('should be symmetric', () => {
        const dist1 = greatCircleDistance(40, -74, 51, 0); // NYC to London
        const dist2 = greatCircleDistance(51, 0, 40, -74); // London to NYC
        expect(dist1).toBeCloseTo(dist2, 10);
    });
});

describe('AstroMath sphericalMidpoint', () => {
    it('should find midpoint between two positions', () => {
        // Midpoint on equator between 0° and 90° longitude
        const mid = sphericalMidpoint(0, 0, 0, 90);

        // Should be roughly at 45° longitude
        expect(mid.y).toBeCloseTo(45, 1);
        expect(mid.x).toBeCloseTo(0, 1); // Should stay on equator
    });

    it('should handle north-south midpoints', () => {
        // Midpoint between North and South poles (on prime meridian)
        const mid = sphericalMidpoint(90, 0, -90, 0);

        // Should be on equator
        expect(mid.x).toBeCloseTo(0, 1);
    });

    it('should handle nearly identical points', () => {
        const mid = sphericalMidpoint(0, 0, 0.001, 0.001);

        // Should be very close to origin
        expect(mid.x).toBeCloseTo(0, 2);
        expect(mid.y).toBeCloseTo(0, 2);
    });
});