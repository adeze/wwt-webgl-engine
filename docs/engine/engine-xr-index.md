+++
+++

This package, `@wwtelescope/engine-xr`, provides WebXR functionality for
WorldWide Telescope powered by Babylon.js.

## Features

- 🥽 **WebXR Support**: Full immersive VR/AR experiences
- 🍎 **Vision Pro Optimized**: Apple Vision Pro specific enhancements
- 🎮 **6DOF Controllers**: Hand tracking and gesture controls
- 🌌 **Astronomical Viz**: Immersive cosmic environments
- 🔗 **Seamless Integration**: Works with existing WWT 2D engine

## Installation

```bash
npm install @wwtelescope/engine-xr
```

## Quick Start

```typescript
import { XREngine } from "@wwtelescope/engine-xr";

const xrEngine = new XREngine({
  canvas: document.getElementById("renderCanvas"),
  enableVisionPro: true,
});

await xrEngine.initialize();

// Check XR support
if (await XREngine.isXRSupported()) {
  await xrEngine.enterXR();
}
```

## Architecture

The XR engine follows a **hybrid architecture**:

1. **Babylon.js Core**: Handles 3D rendering, XR session management, and WebGL
2. **WWT Integration**: Synchronizes astronomical data, time, and camera state
3. **Platform Optimization**: Device-specific features (Vision Pro, Quest, etc.)

## Key Classes

- **`XREngine`**: Main entry point for XR functionality
- **`XRSceneManager`**: Scene setup and astronomical object management
- **`XRControllerManager`**: Input handling and controller tracking
- **`WWTIntegration`**: Bridge to 2D WWT engine
- **`VisionProOptimizer`**: Apple Vision Pro specific optimizations

## API Reference

For detailed API documentation, see the [API reference](@/apiref/engine-xr/index.html).

## Examples

### Basic VR Session

```typescript
const xrEngine = new XREngine({ canvas: myCanvas });
await xrEngine.initialize();
await xrEngine.enterXR();
```

### Vision Pro with Hand Tracking

```typescript
const xrEngine = new XREngine({
  canvas: myCanvas,
  enableVisionPro: true,
  enableHandTracking: true,
  enableEyeTracking: true,
});

await xrEngine.initialize();
await xrEngine.enterXR();
```

### Synchronized with 2D Engine

```typescript
const xrEngine = new XREngine({ canvas: myCanvas });
await xrEngine.initialize();

const integration = xrEngine.getWWTIntegration();
integration.enableSync();

// Now camera and time sync between 2D and XR
```

## Development Roadmap

### Phase 1: Foundation (Current)

- ✅ Core XR engine structure
- ✅ Babylon.js integration
- ⏳ Basic scene rendering
- ⏳ Controller support

### Phase 2: Integration

- WWT data layer connection
- Camera synchronization
- Time synchronization
- Annotation sharing

### Phase 3: Polish

- Performance optimization
- Advanced Vision Pro features
- Spatial audio
- Gesture controls

## Resources

- [Babylon.js Documentation](https://doc.babylonjs.com/)
- [WebXR Specification](https://immersiveweb.dev/)
- [Vision Pro Developer Docs](https://developer.apple.com/visionos/)
