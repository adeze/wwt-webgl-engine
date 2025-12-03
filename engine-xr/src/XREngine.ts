import { Engine, Scene } from '@babylonjs/core';
import type { XREngineOptions } from './types';
import { XRSceneManager } from './scene/XRSceneManager';
import { XRControllerManager } from './controllers/XRControllerManager';
import { WWTIntegration } from './wwt-integration/WWTIntegration';
import { VisionProOptimizer } from './visionpro/VisionProOptimizer';

/**
 * Main XR engine class for WorldWide Telescope
 * 
 * Provides WebXR functionality powered by Babylon.js with seamless
 * integration to the existing WWT 2D engine.
 * 
 * @example
 * ```typescript
 * const xrEngine = new XREngine({
 *   canvas: document.getElementById('renderCanvas'),
 *   enableVisionPro: true,
 * });
 * 
 * await xrEngine.initialize();
 * await xrEngine.enterXR();
 * ```
 */
export class XREngine {
    private engine: Engine | null = null;
    private scene: Scene | null = null;
    private sceneManager: XRSceneManager | null = null;
    private controllerManager: XRControllerManager | null = null;
    private wwtIntegration: WWTIntegration | null = null;
    private visionProOptimizer: VisionProOptimizer | null = null;

    private readonly options: XREngineOptions;
    private isInitialized = false;
    private isXRActive = false;

    /**
     * Creates a new XR engine instance
     * @param options - Configuration options
     */
    constructor(options: XREngineOptions) {
        this.options = options;
    }

    /**
     * Initializes the XR engine and Babylon.js scene
     * 
     * Must be called before enterXR()
     */
    async initialize(): Promise<void> {
        if (this.isInitialized) {
            console.warn('XREngine already initialized');
            return;
        }

        // Create Babylon.js engine
        this.engine = new Engine(this.options.canvas, true, {
            preserveDrawingBuffer: true,
            stencil: true,
        });

        // Create scene
        this.scene = new Scene(this.engine);

        // Initialize managers
        this.sceneManager = new XRSceneManager(this.scene);
        this.controllerManager = new XRControllerManager(this.scene);
        this.wwtIntegration = new WWTIntegration();

        // Initialize Vision Pro optimizer if enabled
        if (this.options.enableVisionPro) {
            this.visionProOptimizer = new VisionProOptimizer(this.scene);
        }

        // Start render loop
        this.engine.runRenderLoop(() => {
            if (this.scene) {
                this.scene.render();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.engine?.resize();
        });

        this.isInitialized = true;
    }

    /**
     * Enters XR mode
     * 
     * Requests WebXR session and transitions to immersive mode
     */
    async enterXR(): Promise<void> {
        if (!this.isInitialized) {
            throw new Error('XREngine not initialized. Call initialize() first.');
        }

        if (this.isXRActive) {
            console.warn('Already in XR mode');
            return;
        }

        if (!this.scene) {
            throw new Error('Scene not available');
        }

        // Check WebXR support
        if (!('xr' in navigator)) {
            throw new Error('WebXR not supported in this browser');
        }

        // Create default WebXR experience
        const xrHelper = await this.scene.createDefaultXRExperienceAsync({
            floorMeshes: [],
            ...this.options.sessionConfig,
        });

        if (!xrHelper.baseExperience) {
            throw new Error('Failed to create XR experience');
        }

        // Configure XR session
        if (this.options.enableHandTracking) {
            try {
                await xrHelper.baseExperience.featuresManager.enableFeature(
                    'hand-tracking' as any,
                    'latest',
                    { xrInput: xrHelper.input }
                );
            } catch (e) {
                console.warn('Hand tracking not supported:', e);
            }
        }        // Enter XR session
        await xrHelper.baseExperience.enterXRAsync(
            this.options.sessionConfig?.mode || 'immersive-vr',
            'local-floor'
        );

        this.isXRActive = true;
    }

    /**
     * Exits XR mode and returns to normal rendering
     */
    async exitXR(): Promise<void> {
        if (!this.isXRActive) {
            console.warn('Not in XR mode');
            return;
        }

        if (this.scene?.activeCamera) {
            const engine = this.scene.getEngine() as any;
            const xrHelper = engine.xr;
            if (xrHelper) {
                await xrHelper.baseExperience?.exitXRAsync();
            }
        }

        this.isXRActive = false;
    }    /**
     * Checks if device supports WebXR
     */
    static async isXRSupported(): Promise<boolean> {
        if (!('xr' in navigator)) {
            return false;
        }

        try {
            const xr = (navigator as any).xr;
            return await xr.isSessionSupported('immersive-vr');
        } catch {
            return false;
        }
    }

    /**
     * Gets the current XR session state
     */
    get xrActive(): boolean {
        return this.isXRActive;
    }

    /**
     * Gets the Babylon.js scene instance
     */
    get babylonScene(): Scene | null {
        return this.scene;
    }

    /**
     * Gets the scene manager
     */
    getSceneManager(): XRSceneManager | null {
        return this.sceneManager;
    }

    /**
     * Gets the controller manager
     */
    getControllerManager(): XRControllerManager | null {
        return this.controllerManager;
    }

    /**
     * Gets the WWT integration layer
     */
    getWWTIntegration(): WWTIntegration | null {
        return this.wwtIntegration;
    }

    /**
     * Disposes the XR engine and releases resources
     */
    dispose(): void {
        this.sceneManager?.dispose();
        this.controllerManager?.dispose();
        this.wwtIntegration?.dispose();
        this.visionProOptimizer?.dispose();

        this.scene?.dispose();
        this.engine?.dispose();

        this.isInitialized = false;
        this.isXRActive = false;
    }
}
