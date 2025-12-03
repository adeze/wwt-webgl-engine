/**
 * Camera Animation System using Babylon.js
 * 
 * Replaces WWT's custom ViewMover with Babylon.js Animation system.
 * Provides smooth camera transitions with multiple easing functions.
 */

import {
    CubicEase,
    EasingFunction,
    QuadraticEase,
    ExponentialEase,
} from '@babylonjs/core/Animations';
import { Vector3 } from '@babylonjs/core/Maths';
import { slerp } from '../math/AstroMath';/**
 * Easing function types matching WWT's legacy behavior
 */
export enum EasingType {
    Linear = 'linear',
    EaseIn = 'easein',
    EaseOut = 'easeout',
    EaseInOut = 'easeinout',
    Exponential = 'exponential',
}

/**
 * Camera animation configuration
 */
export interface CameraAnimationConfig {
    /** Starting position */
    startPosition: Vector3;
    /** Ending position */
    endPosition: Vector3;
    /** Starting look-at target */
    startTarget?: Vector3;
    /** Ending look-at target */
    endTarget?: Vector3;
    /** Duration in milliseconds */
    duration: number;
    /** Easing function */
    easing?: EasingType;
    /** Whether to use spherical interpolation */
    useSphericalInterpolation?: boolean;
}

/**
 * Camera animator using Babylon.js animation system
 * 
 * Provides smooth camera transitions with customizable easing.
 * Supports both linear interpolation and spherical interpolation
 * for astronomical camera movements.
 */
export class CameraAnimator {
    private config: CameraAnimationConfig;
    private startTime: number;
    private currentTime: number;
    private isAnimating: boolean;
    private easingFunction: EasingFunction;

    constructor(config: CameraAnimationConfig) {
        this.config = config;
        this.startTime = 0;
        this.currentTime = 0;
        this.isAnimating = false;
        this.easingFunction = this.createEasingFunction(config.easing || EasingType.EaseInOut);
    }

    /**
     * Creates a Babylon.js easing function from EasingType
     */
    private createEasingFunction(type: EasingType): EasingFunction {
        let easing: EasingFunction;

        switch (type) {
            case EasingType.Linear:
                // No easing - linear interpolation
                easing = new CubicEase();
                easing.setEasingMode(EasingFunction.EASINGMODE_EASEIN);
                break;

            case EasingType.EaseIn:
                easing = new QuadraticEase();
                easing.setEasingMode(EasingFunction.EASINGMODE_EASEIN);
                break;

            case EasingType.EaseOut:
                easing = new QuadraticEase();
                easing.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);
                break;

            case EasingType.EaseInOut:
                easing = new CubicEase();
                easing.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
                break;

            case EasingType.Exponential:
                easing = new ExponentialEase();
                easing.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
                break;

            default:
                easing = new CubicEase();
                easing.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
        }

        return easing;
    }

    /**
     * Starts the animation
     */
    start(): void {
        this.startTime = performance.now();
        this.currentTime = 0;
        this.isAnimating = true;
    }

    /**
     * Updates animation and returns current camera state
     * 
     * @returns Current position and target, or null if animation finished
     */
    update(): { position: Vector3; target?: Vector3 } | null {
        if (!this.isAnimating) {
            return null;
        }

        this.currentTime = performance.now() - this.startTime;
        const progress = Math.min(this.currentTime / this.config.duration, 1.0);

        // Apply easing
        const easedProgress = this.easingFunction.ease(progress);

        // Interpolate position
        let position: Vector3;
        if (this.config.useSphericalInterpolation) {
            // Use slerp for spherical interpolation (better for astronomical cameras)
            position = slerp(
                this.config.startPosition.normalize(),
                this.config.endPosition.normalize(),
                easedProgress
            );

            // Scale to maintain distance
            const startDist = this.config.startPosition.length();
            const endDist = this.config.endPosition.length();
            const dist = startDist + (endDist - startDist) * easedProgress;
            position.scaleInPlace(dist);
        } else {
            // Linear interpolation
            position = Vector3.Lerp(
                this.config.startPosition,
                this.config.endPosition,
                easedProgress
            );
        }

        // Interpolate target if specified
        let target: Vector3 | undefined;
        if (this.config.startTarget && this.config.endTarget) {
            if (this.config.useSphericalInterpolation) {
                target = slerp(
                    this.config.startTarget.normalize(),
                    this.config.endTarget.normalize(),
                    easedProgress
                );
            } else {
                target = Vector3.Lerp(
                    this.config.startTarget,
                    this.config.endTarget,
                    easedProgress
                );
            }
        }

        // Check if animation finished
        if (progress >= 1.0) {
            this.isAnimating = false;
            return {
                position: this.config.endPosition,
                target: this.config.endTarget,
            };
        }

        return { position, target };
    }

    /**
     * Stops the animation
     */
    stop(): void {
        this.isAnimating = false;
    }

    /**
     * Returns whether animation is currently running
     */
    get active(): boolean {
        return this.isAnimating;
    }

    /**
     * Returns current progress (0-1)
     */
    get progress(): number {
        if (!this.isAnimating) {
            return 1.0;
        }
        return Math.min(this.currentTime / this.config.duration, 1.0);
    }
}

/**
 * Helper function to create a simple camera move animation
 * 
 * @example
 * ```typescript
 * const animator = createCameraMove(
 *   new Vector3(0, 0, 10),
 *   new Vector3(5, 5, 20),
 *   2000, // 2 seconds
 *   EasingType.EaseInOut
 * );
 * 
 * animator.start();
 * 
 * function animate() {
 *   const state = animator.update();
 *   if (state) {
 *     camera.position = state.position;
 *     requestAnimationFrame(animate);
 *   }
 * }
 * animate();
 * ```
 */
export function createCameraMove(
    from: Vector3,
    to: Vector3,
    durationMs: number,
    easing: EasingType = EasingType.EaseInOut,
    useSpherical = true
): CameraAnimator {
    return new CameraAnimator({
        startPosition: from,
        endPosition: to,
        duration: durationMs,
        easing,
        useSphericalInterpolation: useSpherical,
    });
}

/**
 * Chain multiple camera animations
 */
export class CameraAnimationChain {
    private animations: CameraAnimator[];
    private currentIndex: number;

    constructor(animations: CameraAnimator[]) {
        this.animations = animations;
        this.currentIndex = 0;
    }

    start(): void {
        if (this.animations.length > 0) {
            this.currentIndex = 0;
            this.animations[0].start();
        }
    }

    update(): { position: Vector3; target?: Vector3 } | null {
        if (this.currentIndex >= this.animations.length) {
            return null; // All animations finished
        }

        const current = this.animations[this.currentIndex];
        const state = current.update();

        if (!state && this.currentIndex < this.animations.length - 1) {
            // Current animation finished, start next
            this.currentIndex++;
            this.animations[this.currentIndex].start();
            return this.update(); // Recurse to get first frame of next animation
        }

        return state;
    }

    get active(): boolean {
        return this.currentIndex < this.animations.length &&
            this.animations[this.currentIndex].active;
    }
}
