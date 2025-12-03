/**
 * Configuration options for XREngine initialization
 */
export interface XREngineOptions {
    /** Canvas element for rendering */
    canvas: HTMLCanvasElement;

    /** Enable Apple Vision Pro optimizations */
    enableVisionPro?: boolean;

    /** Enable hand tracking */
    enableHandTracking?: boolean;

    /** Enable eye tracking */
    enableEyeTracking?: boolean;

    /** XR session configuration */
    sessionConfig?: XRSessionConfig;
}

/**
 * WebXR session configuration
 */
export interface XRSessionConfig {
    /** XR session mode: 'immersive-vr' | 'immersive-ar' */
    mode?: 'immersive-vr' | 'immersive-ar' | 'inline';

    /** Required features for XR session */
    requiredFeatures?: string[];

    /** Optional features for XR session */
    optionalFeatures?: string[];
}

/**
 * XR controller configuration
 */
export interface XRControllerConfig {
    /** Enable teleportation */
    enableTeleportation?: boolean;

    /** Enable pointer ray */
    enablePointerRay?: boolean;

    /** Controller model visibility */
    showControllers?: boolean;
}

/**
 * WWT integration configuration
 */
export interface WWTIntegrationConfig {
    /** Synchronize camera between 2D and XR engines */
    syncCamera?: boolean;

    /** Synchronize time between engines */
    syncTime?: boolean;

    /** Share annotation data */
    shareAnnotations?: boolean;
}
