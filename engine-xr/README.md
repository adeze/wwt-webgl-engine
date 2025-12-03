# @wwtelescope/engine-xr

**WebXR engine for WorldWide Telescope powered by Babylon.js**

This package provides immersive 3D/XR experiences for WorldWide Telescope, built on top of Babylon.js. It supports:

- ✨ WebXR API for VR/AR devices
- 🥽 Apple Vision Pro optimization
- 🎮 6DOF controller support
- 🌌 Immersive astronomical visualization
- 🔗 Integration with existing WWT engine

## Installation

```bash
yarn add @wwtelescope/engine-xr
```

## Usage

```typescript
import { XREngine } from "@wwtelescope/engine-xr";

const xrEngine = new XREngine({
  canvas: document.getElementById("renderCanvas"),
  enableVisionPro: true,
});

await xrEngine.initialize();
await xrEngine.enterXR();
```

## Features

### Immersive Mode

- Full 360° astronomical environments
- Spatial audio for celestial objects
- Hand tracking and gesture controls

### Vision Pro Optimization

- High-resolution passthrough
- Spatial computing integration
- Eye tracking for interaction

### WWT Integration

- Seamless data sharing with 2D engine
- Synchronized tours and annotations
- Cross-mode navigation

### Modern Math Library

- Babylon.js math primitives (Vector3, Matrix, Quaternion)
- Higher precision than legacy WWT math (Math.PI vs 3.1415927)
- SIMD-optimized operations for better performance
- Compatibility layer for WWT Vector3d/Matrix3d conversion
- Astronomical coordinate utilities (RA/Dec, lat/lng, azimuth/altitude)

## Development

```bash
# Build
yarn build

# Lint
yarn lint

# Generate docs
yarn doc
```

## Architecture

The XR engine follows a hybrid approach:

- Babylon.js handles 3D rendering and XR session management
- WWT engine provides astronomical data and calculations
- Integration layer synchronizes state between engines

## License

MIT - See LICENSE file for details
