export { XREngine } from './XREngine';
export { XRSceneManager } from './scene/XRSceneManager';
export { XRControllerManager } from './controllers/XRControllerManager';
export { WWTIntegration } from './wwt-integration/WWTIntegration';
export { VisionProOptimizer } from './visionpro/VisionProOptimizer';

export type {
    XREngineOptions,
    XRSessionConfig,
    XRControllerConfig,
    WWTIntegrationConfig,
} from './types';

// Math utilities - Babylon.js based
export {
    Vector2,
    Vector3,
    Vector4,
    Matrix,
    Quaternion,
    Color3,
    Color4,
    MathConstants,
} from './math/BabylonMath';

// WWT compatibility layer
export {
    wwtToBabylon,
    babylonToWWT,
    wwtMatrixToBabylon,
    babylonMatrixToWWT,
    copyWWTToBabylon,
    copyBabylonToWWT,
    batchWWTToBabylon,
    batchBabylonToWWT,
} from './math/WWTCompat';

export type {
    WWTVector3d,
    WWTMatrix3d,
} from './math/WWTCompat';

// Astronomical math utilities
export {
    geoTo3D,
    cartesianToSpherical,
    raDecTo3D,
    cartesianToRaDec,
    slerp,
    greatCircleDistance,
    sphericalMidpoint,
    projectToXY,
    projectToXZ,
    rotateAroundY,
    cartesianToAzAlt,
    azAltTo3D,
} from './math/AstroMath';

// Animation system
export {
    CameraAnimator,
    CameraAnimationChain,
    createCameraMove,
    EasingType,
} from './animation/CameraAnimator';

export type {
    CameraAnimationConfig,
} from './animation/CameraAnimator';
