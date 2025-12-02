# WebXR Integration Strategy for WorldWide Telescope

## Executive Summary

This document evaluates options for adding WebXR support to WorldWide Telescope, with particular focus on Apple Vision Pro compatibility. After analyzing the current architecture and available frameworks, I present three strategic approaches with varying levels of effort and architectural impact.

## Current Architecture Analysis

### WWT WebGL Engine Structure

**Core Rendering System:**

- Custom WebGL 1.0/2.0 engine written in ES6 JavaScript (transpiled from C#)
- Direct WebGL API calls throughout the codebase (`render_context.js`, custom shaders)
- Tightly coupled rendering pipeline: `RenderContext` → shaders → buffers → tiles
- Astronomical data rendered via HEALPix tiles, TOAST projections, FITS images
- Camera system based on traditional perspective projections (`CameraParameters`)

**Key Technical Characteristics:**

- **Direct WebGL control**: No existing abstraction layer (no Three.js, Babylon.js, etc.)
- **Custom shader system**: 15+ specialized shaders for astronomical rendering
- **Tile-based streaming**: Multi-resolution astronomical data loaded on-demand
- **Legacy C# architecture**: Structure mirrors original Windows client
- **Vue 3/Pinia integration**: Modern frontend wrapping the engine

### Critical Integration Points

1. **Canvas initialization** (`wwt_control.js:194-220`):

   ```javascript
   var gl = canvas.getContext("webgl2");
   globalRenderContext.gl = gl;
   ```

2. **Camera/View matrices** (`render_context.js:575-650`):

   ```javascript
   setupMatricesSpace3d(canvasWidth, canvasHeight)
   set_projection(Matrix3d.perspectiveFovLH(...))
   ```

3. **Render loop** (`wwt_control.js:render()`):
   - Single viewport rendering
   - Fixed camera position
   - No stereo rendering support

## WebXR Integration Options

### Option 1: Babylon.js Full Migration (HIGH EFFORT, HIGH REWARD)

**Approach:** Completely rewrite the rendering engine using Babylon.js while preserving WWT's astronomical data pipeline.

**Architecture:**

```
WWT Data Layer (keep) → Babylon.js Scene Graph (new) → WebXR Manager (new)
├── Astronomical calculations (@wwtelescope/astro)
├── Data streaming (HEALPix, TOAST, FITS)
├── Babylon.js meshes & materials
├── Babylon.js shaders (port WWT shaders)
└── Native WebXR support (built-in)
```

**Advantages:**

- ✅ **Best WebXR support**: Babylon.js has mature, production-ready WebXR implementation
- ✅ **Apple Vision Pro**: Excellent compatibility, officially supported
- ✅ **Modern architecture**: Clean separation of concerns
- ✅ **Rich ecosystem**: Physics, hand tracking, spatial audio, UI components
- ✅ **Performance**: Optimized rendering pipeline, frustum culling, LOD
- ✅ **Future-proof**: Active development, Microsoft backing
- ✅ **Developer experience**: TypeScript-first, excellent documentation

**Disadvantages:**

- ❌ **Massive undertaking**: 6-12 months development time
- ❌ **Complete rewrite**: ~15,000+ lines of rendering code
- ❌ **Risk**: Breaking existing functionality during migration
- ❌ **Shader porting**: All custom astronomical shaders need conversion
- ❌ **Testing burden**: Extensive validation of astronomical accuracy

**Implementation Path:**

1. Create `@wwtelescope/engine-babylon` package
2. Port camera system to Babylon.js camera
3. Migrate tile rendering to Babylon.js textures/materials
4. Convert custom shaders to Babylon.js shader materials
5. Implement WebXR session management
6. Add hand tracking & spatial interaction
7. Parallel development with gradual feature migration

**Estimated Effort:** 8-12 months, 2-3 developers

---

### Option 2: Hybrid Approach with Babylon.js (MEDIUM EFFORT, GOOD COMPROMISE)

**Approach:** Keep WWT's WebGL engine for 2D/desktop rendering, create parallel Babylon.js path for XR mode.

**Architecture:**

```
WWT Engine (existing) ──┐
                        ├──→ Mode Switcher ──→ Output
Babylon.js XR Engine ───┘
```

**Two rendering paths:**

- **2D Mode**: Use existing WWT engine (backward compatible)
- **XR Mode**: Switch to Babylon.js renderer with simplified astronomical rendering

**Advantages:**

- ✅ **Backward compatible**: Existing 2D experience unchanged
- ✅ **Faster time to market**: 3-6 months to working XR prototype
- ✅ **Lower risk**: Original engine remains intact
- ✅ **Incremental development**: Can launch XR as beta feature
- ✅ **Reduced scope**: Only implement XR-critical features initially

**Disadvantages:**

- ⚠️ **Code duplication**: Maintaining two rendering systems
- ⚠️ **Feature parity delays**: XR mode may lack some 2D features
- ⚠️ **Complexity**: Mode switching logic adds complexity
- ⚠️ **Data synchronization**: Camera, settings, state must sync between systems

**Implementation Path:**

1. Create `@wwtelescope/engine-xr` package with Babylon.js
2. Implement basic sky sphere rendering in XR
3. Add essential astronomical features (constellation lines, planet positions)
4. Create mode switch UI ("Enter VR")
5. Gradually add advanced features to XR mode
6. Long-term: Consider full migration to Babylon.js

**Estimated Effort:** 3-6 months, 2 developers

---

### Option 3: WebXR Polyfill + Manual Integration (LOW-MEDIUM EFFORT, LIMITED FEATURES)

**Approach:** Add WebXR API support directly to existing WWT engine with minimal refactoring.

**Architecture:**

```
Existing WWT Engine → WebXR Session Manager → Stereo Rendering → XR Output
```

**Changes Required:**

1. Wrap canvas context with WebXR-compatible rendering loop
2. Implement stereo rendering (left/right eye viewports)
3. Add XR pose tracking to camera system
4. Handle controller/hand input
5. Manage XR session lifecycle

**Advantages:**

- ✅ **Fastest implementation**: 1-3 months
- ✅ **Minimal architecture changes**: ~2,000 lines of new code
- ✅ **Full feature preservation**: All WWT features available in XR
- ✅ **Low risk**: Small, contained changes

**Disadvantages:**

- ❌ **Limited XR features**: Basic view-only experience
- ❌ **Performance concerns**: Not optimized for XR (90fps+)
- ❌ **Apple Vision Pro limitations**: May not work optimally (WebXR support varies)
- ❌ **Maintenance burden**: Custom XR implementation to maintain
- ❌ **No ecosystem**: Must build all XR interactions from scratch
- ❌ **Technical debt**: Adding XR to non-XR-designed architecture

**Implementation Path:**

1. Add `XRSessionManager` class to handle WebXR session
2. Modify `RenderContext` to support stereo viewport rendering
3. Update camera system to accept XR pose data
4. Implement basic gaze-based interaction
5. Test on Quest/Vision Pro

**Estimated Effort:** 1-3 months, 1-2 developers

---

## Apple Vision Pro Specific Considerations

**WebXR Support Status (Dec 2025):**

- ✅ visionOS 1.1+ supports WebXR Device API
- ✅ Safari supports immersive-vr sessions
- ⚠️ Hand tracking support limited
- ⚠️ Some WebXR features may require polyfills

**Vision Pro Optimization Requirements:**

- **High resolution**: 3660×3200 per eye requires LOD optimization
- **90Hz refresh rate**: Consistent frame timing critical
- **Spatial input**: Hand tracking, gaze, and pinch gestures
- **Passthrough mode**: Blend virtual sky with real environment
- **Shared space**: Co-exist with other apps

**Babylon.js Advantages for Vision Pro:**

- Native hand tracking support
- Spatial audio integration
- Performance optimization for high-resolution displays
- Apple-specific testing and optimization

---

## Vue Integration Analysis

### Current WWT Vue Architecture

**Component Structure:**

```vue
<!-- engine-pinia/src/Component.vue -->
<WorldWideTelescope wwt-namespace="mywwt"></WorldWideTelescope>
```

- `WWTComponent` wraps `WWTInstance` from `@wwtelescope/engine-helpers`
- Creates canvas element, initializes WebGL engine, manages render loop
- Integrated with Pinia for state management (`engineStore`)
- Apps extend `WWTAwareComponent` to access WWT engine state

**Key Files:**

- `engine-pinia/src/Component.vue` - Main WWT Vue component
- `engine-pinia/src/store.ts` - Pinia store (1922 lines)
- `engine-pinia/src/wwtaware.ts` - Base class for WWT-aware components

### Babylon.js Vue Integration Options

#### Option A: `@babylonjs/core` Direct Integration (RECOMMENDED) ⭐

**Approach:** Use Babylon.js directly within Vue components, similar to how WWT engine is currently integrated.

```vue
<!-- New: engine-xr/src/XRComponent.vue -->
<template>
  <div>
    <canvas ref="xrCanvas" class="xr-canvas"></canvas>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import * as BABYLON from "@babylonjs/core";

export default defineComponent({
  mounted() {
    const canvas = this.$refs.xrCanvas as HTMLCanvasElement;
    const engine = new BABYLON.Engine(canvas, true);
    const scene = new BABYLON.Scene(engine);

    // Initialize WebXR
    scene.createDefaultXRExperienceAsync({
      uiOptions: { sessionMode: "immersive-vr" },
    });

    // Start render loop
    engine.runRenderLoop(() => scene.render());
  },
});
</script>
```

**Advantages:**

- ✅ **Matches existing pattern**: Same approach as current `WWTComponent`
- ✅ **Direct control**: Full access to Babylon.js APIs
- ✅ **No additional dependencies**: Just `@babylonjs/core`
- ✅ **Type safety**: Full TypeScript support
- ✅ **Pinia integration**: Easy to extend existing `engineStore`

#### Option B: `vue-babylonjs` Library

**About:** Community Vue 3 wrapper for Babylon.js with declarative components.

**Evaluation:**

- ⚠️ **Small ecosystem**: Not officially maintained by Babylon.js team
- ⚠️ **Limited adoption**: ~200 GitHub stars vs 23k for Babylon.js
- ⚠️ **Learning curve**: Another abstraction layer to learn
- ❌ **Unnecessary**: WWT already has working pattern with direct integration

**Verdict:** Not recommended - adds complexity without significant benefits.

#### Option C: Reactylon (React + Babylon.js)

**Evaluation:**

- ❌ **Wrong framework**: WWT uses Vue 3, not React
- ❌ **Major refactoring**: Would require rewriting all Vue apps
- ❌ **Not feasible**: Incompatible with existing Pinia state management

**Verdict:** Not applicable to WWT's Vue-based architecture.

### Recommended Vue Integration Strategy

**Create New Package: `@wwtelescope/engine-xr`**

Mirror the structure of `engine-pinia` but for XR mode:

```
engine-xr/
├── src/
│   ├── XRComponent.vue          # Main XR Vue component
│   ├── xr-store.ts              # Pinia store for XR state
│   ├── xr-aware.ts              # Base class for XR-aware components
│   ├── babylon-wrapper.ts       # Babylon.js initialization logic
│   └── index.ts                 # Public API
├── package.json
└── tsconfig.json
```

**Integration Pattern:**

```typescript
// research-app/src/App.vue
<template>
  <div id="app">
    <!-- Existing 2D mode -->
    <WorldWideTelescope
      v-if="!xrMode"
      wwt-namespace="wwt-research"
    />

    <!-- New XR mode -->
    <XRTelescope
      v-if="xrMode"
      wwt-namespace="wwt-research-xr"
    />

    <button @click="toggleXRMode">
      {{ xrMode ? 'Exit VR' : 'Enter VR' }}
    </button>
  </div>
</template>

<script>
import { WWTComponent } from '@wwtelescope/engine-pinia';
import { XRComponent } from '@wwtelescope/engine-xr';

export default {
  components: {
    WorldWideTelescope: WWTComponent,
    XRTelescope: XRComponent
  },
  data() {
    return { xrMode: false };
  }
};
</script>
```

**Benefits of This Approach:**

- ✅ **Familiar pattern**: Developers already understand how `WWTComponent` works
- ✅ **Minimal Vue refactoring**: Existing apps work unchanged
- ✅ **Gradual adoption**: Can test XR mode independently
- ✅ **State management**: Extend existing Pinia patterns
- ✅ **Type safety**: Full TypeScript support throughout

---

## Recommended Strategy

### Phase 1: Prototype & Validation (2-3 months)

**Choose Option 2 (Hybrid Approach)**

1. Create proof-of-concept XR mode with Babylon.js
2. Implement basic sky sphere with star field
3. Add planet positions and constellation lines
4. Test on Quest 3 and Vision Pro
5. Validate performance and user experience

**Deliverable:** Working XR demo showing WWT astronomical content in immersive mode

### Phase 2: Production XR Feature (3-4 months)

1. Implement full astronomical rendering in Babylon.js
2. Add spatial UI for WWT controls
3. Implement hand tracking and gaze interaction
4. Add data layer visualization (catalog objects)
5. Optimize for 90fps on Vision Pro
6. Launch as beta feature

**Deliverable:** Production-ready "Enter XR Mode" feature in WWT apps

### Phase 3: Long-term Evolution (12+ months)

1. Evaluate user adoption and feedback
2. Decide: Maintain hybrid or migrate fully to Babylon.js
3. Add advanced XR features (spatial tours, collaborative viewing)
4. Expand to other XR platforms (Quest, Pico, etc.)

---

## Technical Implementation Details

### Babylon.js Integration Architecture

```typescript
// New package: @wwtelescope/engine-xr

export class WWTXREngine {
  private scene: BABYLON.Scene;
  private xrHelper: BABYLON.WebXRDefaultExperience;
  private skyDome: BABYLON.Mesh;

  async initialize(canvas: HTMLCanvasElement) {
    const engine = new BABYLON.Engine(canvas, true);
    this.scene = new BABYLON.Scene(engine);

    // Enable WebXR
    this.xrHelper = await this.scene.createDefaultXRExperienceAsync({
      uiOptions: {
        sessionMode: "immersive-vr",
      },
    });

    // Set up astronomical rendering
    this.skyDome = this.createSkySphere();
    await this.loadAstronomicalData();

    // Hand tracking for Vision Pro
    const handTracking =
      this.xrHelper.baseExperience.featuresManager.enableFeature(
        BABYLON.WebXRFeatureName.HAND_TRACKING
      );
  }

  private createSkySphere(): BABYLON.Mesh {
    const sphere = BABYLON.MeshBuilder.CreateSphere(
      "skySphere",
      { diameter: 1000, segments: 64 },
      this.scene
    );

    // Custom shader for astronomical rendering
    sphere.material = this.createAstronomicalMaterial();
    return sphere;
  }

  // Port WWT tile streaming to Babylon.js textures
  private async loadAstronomicalData() {
    // Integrate with existing @wwtelescope/engine data pipeline
    // Stream HEALPix tiles as dynamic textures
  }
}
```

### Data Bridge Pattern

```typescript
// Bridge existing WWT data layer to Babylon.js

import { WWTControl } from "@wwtelescope/engine";
import { WWTXREngine } from "@wwtelescope/engine-xr";

class WWT2DTo3DBridge {
  constructor(private wwtEngine: WWTControl, private xrEngine: WWTXREngine) {}

  syncCameraState() {
    const wwtCam = this.wwtEngine.renderContext.viewCamera;
    this.xrEngine.setCameraFromRADec(wwtCam.lng, wwtCam.lat, wwtCam.zoom);
  }

  syncVisibleData() {
    // Transfer visible catalog objects, annotations, etc.
  }
}
```

---

## Cost-Benefit Analysis

| Aspect                 | Option 1 (Full Migration) | Option 2 (Hybrid) | Option 3 (Manual) |
| ---------------------- | ------------------------- | ----------------- | ----------------- |
| **Development Time**   | 8-12 months               | 3-6 months        | 1-3 months        |
| **Team Size**          | 2-3 developers            | 2 developers      | 1-2 developers    |
| **XR Feature Quality** | ⭐⭐⭐⭐⭐                | ⭐⭐⭐⭐          | ⭐⭐⭐            |
| **Vision Pro Support** | Excellent                 | Good              | Basic             |
| **Performance**        | Optimized                 | Good              | Adequate          |
| **Risk Level**         | High                      | Medium            | Low               |
| **Maintainability**    | Excellent                 | Medium            | Poor              |
| **Future-proofing**    | Best                      | Good              | Limited           |

---

## Final Recommendation

**Choose Option 2: Hybrid Approach with Babylon.js**

**Rationale:**

1. **Balance**: Good XR quality without massive rewrite risk
2. **Time to market**: Can ship XR feature in 6 months
3. **Low risk**: Original WWT engine untouched
4. **Apple Vision Pro**: Babylon.js provides excellent visionOS support
5. **Flexibility**: Can evolve to full migration if XR adoption is strong

**Next Steps:**

1. Create proof-of-concept branch
2. Set up `@wwtelescope/engine-xr` package
3. Implement basic Babylon.js sky sphere with WWT star data
4. Test on Vision Pro simulator/device
5. Present demo to stakeholders for go/no-go decision

**Budget Estimate:**

- **Phase 1 (Prototype)**: 2-3 months, 2 developers = $40-60k
- **Phase 2 (Production)**: 3-4 months, 2 developers = $60-80k
- **Total**: $100-140k for production XR feature

---

## Questions to Consider

1. **Target platforms**: Vision Pro only, or multi-platform (Quest, Pico)?
2. **Feature priority**: Which WWT features are essential for XR launch?
3. **User research**: Has there been validation of XR demand from astronomers/educators?
4. **Performance targets**: What minimum frame rate is acceptable?
5. **Accessibility**: How to make XR experience accessible to users without headsets?

Would you like me to:

- Create a detailed technical specification for Option 2?
- Set up a prototype branch with Babylon.js integration?
- Estimate effort for specific XR features you want to prioritize?
