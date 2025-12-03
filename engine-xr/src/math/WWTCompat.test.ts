import { describe, it, expect } from 'vitest';
import { Vector3 } from './BabylonMath';
import {
    wwtToBabylon,
    babylonToWWT
} from './WWTCompat';

describe('WWTCompat Vector3 Conversions', () => {
    it('should convert WWT Vector3d to Babylon Vector3', () => {
        const wwt = { x: 1, y: 2, z: 3 };
        const babylon = wwtToBabylon(wwt);

        expect(babylon.x).toBe(1);
        expect(babylon.y).toBe(2);
        expect(babylon.z).toBe(3);
    });

    it('should convert Babylon Vector3 to WWT Vector3d', () => {
        const babylon = new Vector3(1, 2, 3);
        const wwt = babylonToWWT(babylon);

        expect(wwt.x).toBe(1);
        expect(wwt.y).toBe(2);
        expect(wwt.z).toBe(3);
    });

    it('should handle round-trip conversion', () => {
        const original = { x: 4.5, y: -2.3, z: 7.8 };
        const babylon = wwtToBabylon(original);
        const roundTrip = babylonToWWT(babylon);

        expect(roundTrip.x).toBeCloseTo(original.x, 10);
        expect(roundTrip.y).toBeCloseTo(original.y, 10);
        expect(roundTrip.z).toBeCloseTo(original.z, 10);
    });

    it('should handle zero vectors', () => {
        const zero = { x: 0, y: 0, z: 0 };
        const babylon = wwtToBabylon(zero);
        const roundTrip = babylonToWWT(babylon);

        expect(roundTrip.x).toBe(0);
        expect(roundTrip.y).toBe(0);
        expect(roundTrip.z).toBe(0);
    });

    it('should handle negative values', () => {
        const negative = { x: -1, y: -2, z: -3 };
        const babylon = wwtToBabylon(negative);

        expect(babylon.x).toBe(-1);
        expect(babylon.y).toBe(-2);
        expect(babylon.z).toBe(-3);
    });
});
