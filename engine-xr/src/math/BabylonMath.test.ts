import { describe, it, expect } from 'vitest';
import { Vector3, Matrix, Quaternion, MathConstants } from './BabylonMath';

describe('BabylonMath Constants', () => {
    it('should have accurate high-precision constants', () => {
        expect(MathConstants.DEG_TO_RAD).toBeCloseTo(Math.PI / 180, 15);
        expect(MathConstants.RAD_TO_DEG).toBeCloseTo(180 / Math.PI, 15);
        expect(MathConstants.TWO_PI).toBeCloseTo(2 * Math.PI, 15);
        expect(MathConstants.HALF_PI).toBeCloseTo(Math.PI / 2, 15);
        expect(MathConstants.EPSILON).toBe(0.000001);
    });

    it('should convert degrees to radians correctly', () => {
        const degrees90 = 90 * MathConstants.DEG_TO_RAD;
        expect(degrees90).toBeCloseTo(Math.PI / 2, 10);

        const degrees180 = 180 * MathConstants.DEG_TO_RAD;
        expect(degrees180).toBeCloseTo(Math.PI, 10);

        const degrees360 = 360 * MathConstants.DEG_TO_RAD;
        expect(degrees360).toBeCloseTo(MathConstants.TWO_PI, 10);
    });

    it('should convert radians to degrees correctly', () => {
        const halfPi = (Math.PI / 2) * MathConstants.RAD_TO_DEG;
        expect(halfPi).toBeCloseTo(90, 10);

        const pi = Math.PI * MathConstants.RAD_TO_DEG;
        expect(pi).toBeCloseTo(180, 10);

        const twoPi = MathConstants.TWO_PI * MathConstants.RAD_TO_DEG;
        expect(twoPi).toBeCloseTo(360, 10);
    });
});

describe('Babylon.js Types', () => {
    it('should create Vector3 instances', () => {
        const v = new Vector3(1, 2, 3);
        expect(v.x).toBe(1);
        expect(v.y).toBe(2);
        expect(v.z).toBe(3);
    });

    it('should perform Vector3 operations', () => {
        const v1 = new Vector3(1, 2, 3);
        const v2 = new Vector3(4, 5, 6);
        const sum = v1.add(v2);

        expect(sum.x).toBe(5);
        expect(sum.y).toBe(7);
        expect(sum.z).toBe(9);
    });

    it('should create Matrix instances', () => {
        const m = Matrix.Identity();
        expect(m).toBeDefined();
        expect(m.isIdentity()).toBe(true);
    }); it('should create Quaternion instances', () => {
        const q = Quaternion.Identity();
        expect(q.x).toBe(0);
        expect(q.y).toBe(0);
        expect(q.z).toBe(0);
        expect(q.w).toBe(1);
    });

    it('should calculate vector length', () => {
        const v = new Vector3(3, 4, 0);
        expect(v.length()).toBe(5);
    });

    it('should normalize vectors', () => {
        const v = new Vector3(3, 4, 0);
        const normalized = v.normalize();
        expect(normalized.length()).toBeCloseTo(1, 10);
    });

    it('should calculate dot product', () => {
        const v1 = new Vector3(1, 0, 0);
        const v2 = new Vector3(0, 1, 0);
        const dot = Vector3.Dot(v1, v2);
        expect(dot).toBe(0);

        const v3 = new Vector3(1, 0, 0);
        const v4 = new Vector3(1, 0, 0);
        const dot2 = Vector3.Dot(v3, v4);
        expect(dot2).toBe(1);
    });

    it('should calculate cross product', () => {
        const v1 = new Vector3(1, 0, 0);
        const v2 = new Vector3(0, 1, 0);
        const cross = Vector3.Cross(v1, v2);

        expect(cross.x).toBeCloseTo(0, 10);
        expect(cross.y).toBeCloseTo(0, 10);
        expect(cross.z).toBeCloseTo(1, 10);
    });
});
