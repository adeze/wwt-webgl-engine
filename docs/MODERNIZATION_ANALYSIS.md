# WWT Engine Modernization Opportunities

## Executive Summary

Analysis of components in the WWT engine that could be replaced with Babylon.js and modern frameworks. This focuses on **pragmatic wins** - areas where modern libraries provide better performance, maintainability, or features **without** requiring a complete rewrite.

## High-Value Replacement Candidates

### 1. Math/Linear Algebra (`double3d.js`) - 2,327 lines

**Current Implementation:**

- Custom `Vector3d`, `Vector2d`, `Matrix3d` classes
- Manual matrix operations, transformations
- Low precision constants (`RC = 3.1415927 / 180`)

**Replace With:**

- **`@babylonjs/core/Maths`** (Vector3, Matrix, Quaternion)
- **`gl-matrix`** (lightweight alternative, 12KB)
- **`three/math`** (if considering Three.js)

**Benefits:**

- ✅ Well-tested, optimized implementations
- ✅ SIMD acceleration support
- ✅ Better precision
- ✅ Reduce ~1,500 lines of math code
- ✅ WebGPU-ready (Babylon.js future)

**Effort:** Medium (2-3 weeks)
**Risk:** Medium - core math affects everything
**Priority:** HIGH for Babylon.js migration path

---

### 2. Animation/Interpolation (`view_mover.js`, `camera_parameters.js`)

**Current Implementation:**

- Custom interpolation functions (linear, log, easein/out)
- Manual alpha/time calculations
- Camera parameter interpolation

**Replace With:**

- **Babylon.js Animation system** (`@babylonjs/core/Animations`)
  - Built-in easing functions
  - AnimationGroup for complex sequences
  - Timeline management
- **Alternative:** `gsap` (industry standard, but overkill)

**Benefits:**

- ✅ More easing curves available
- ✅ Better performance
- ✅ Animation groups for complex tours
- ✅ Reduce ~300 lines of interpolation code

**Effort:** Low-Medium (1-2 weeks)
**Risk:** Low
**Priority:** MEDIUM

---

### 3. 3D Primitives (`graphics/primitives3d.js`) - 930 lines

**Current Implementation:**

- Custom line lists, triangle lists
- Manual vertex buffer management
- Custom drawing routines

**Replace With:**

- **Babylon.js Mesh library**
  - `LinesMesh`, `GreasedLineMesh`
  - Built-in geometry primitives
  - Instanced rendering support

**Benefits:**

- ✅ Hardware instancing for better performance
- ✅ Automatic frustum culling
- ✅ Level-of-detail (LOD) support
- ✅ Reduce ~600 lines of primitive code

**Effort:** Medium (3-4 weeks)
**Risk:** Medium - affects rendering pipeline
**Priority:** MEDIUM (only if doing Babylon.js migration)

---

### 4. Texture Management (`graphics/texture.js`)

**Current Implementation:**

- Custom texture loading and caching
- Manual WebGL texture creation
- Canvas-based texture generation

**Replace With:**

- **Babylon.js Texture system**
  - Automatic format detection
  - Built-in compression (KTX2, Basis)
  - Streaming texture loading
- **Alternative:** `@loaders.gl/textures`

**Benefits:**

- ✅ Modern format support (WebP, AVIF)
- ✅ GPU texture compression
- ✅ Better memory management
- ✅ Reduce ~400 lines

**Effort:** Medium (2-3 weeks)
**Risk:** Low-Medium
**Priority:** MEDIUM

---

### 5. UI/Input Handling (`util.js`, `ui_tools.js`)

**Current Implementation:**

- Custom mouse/touch handling
- Manual event coordinate conversion
- Legacy Rectangle class

**Replace With:**

- **Babylon.js Scene.pointerObservable**
  - Unified pointer events (mouse/touch/pen)
  - Built-in picking/raycasting
  - Multi-touch gestures
- **Vue event handlers** (for 2D UI elements)

**Benefits:**

- ✅ Modern event API
- ✅ Better multi-touch support
- ✅ Apple Pencil support
- ✅ WebXR controller integration

**Effort:** Low-Medium (2 weeks)
**Risk:** Low
**Priority:** HIGH (enables better XR interactions)

---

### 6. Shader Management (`graphics/shaders.js`) - 2,100+ lines

**Current Implementation:**

- 15+ custom shaders with string concatenation
- Manual shader compilation
- Hardcoded uniform/attribute locations

**Replace With:**

- **Babylon.js ShaderMaterial system**
  - Effect/ShaderStore management
  - Automatic uniform binding
  - Hot shader reloading (dev mode)
- **Keep custom astronomical shaders** but use better infrastructure

**Benefits:**

- ✅ Better shader debugging
- ✅ Cleaner shader code organization
- ✅ Automatic optimization
- ✅ Reduce boilerplate by ~40%

**Effort:** High (4-6 weeks) - but only if migrating
**Risk:** High - shaders are critical
**Priority:** LOW (keep as-is for now)

---

## Lower Priority / Keep As-Is

### Astronomical Calculations (`astrocalc/`)

**Verdict:** KEEP - This is WWT's core value

- Highly specialized astronomical algorithms
- Tested and validated against known data
- No equivalent in Babylon.js
- **Don't replace** - these are WWT's domain expertise

### Tile System (HEALPix, TOAST, FITS)

**Verdict:** KEEP - Unique to WWT

- Custom tile projections for sky surveys
- FITS image support
- No standard library replacements
- Can integrate with Babylon.js textures, but keep the logic

### Tour System (`tours/`)

**Verdict:** KEEP - Unique format

- WWT tour file format
- Could enhance with Babylon.js animations
- But preserve existing tour playback

---

## Modernization Strategy: Hybrid Approach

### Phase 1: Non-Breaking Improvements (Now)

**Goal:** Reduce technical debt without changing architecture

1. **Add modern utilities alongside legacy code:**

   ```javascript
   import { Vector3 } from "@babylonjs/core/Maths";

   // New code uses Babylon.js
   const position = new Vector3(x, y, z);

   // Legacy code still works
   const oldPosition = Vector3d.create(x, y, z);
   ```

2. **Gradually migrate functions:**

   - Start with math utilities
   - Add adapter functions for compatibility
   - Remove old code when all references gone

3. **Install dependencies:**
   ```bash
   yarn add @babylonjs/core @babylonjs/loaders
   ```

**Benefits:**

- ✅ No breaking changes
- ✅ Can migrate incrementally
- ✅ Test Babylon.js compatibility

**Effort:** 2-3 months, 1 developer

---

### Phase 2: XR Package with Babylon.js (3-6 months)

**Goal:** Create `@wwtelescope/engine-xr` using Babylon.js

1. **New package uses Babylon.js from day one:**

   - Babylon.js math, meshes, materials
   - WWT astronomical data integration
   - Modern shader infrastructure

2. **Adapter layer for WWT data:**

   ```typescript
   // Convert WWT tile data to Babylon.js textures
   class WWT2BabylonBridge {
     async loadHEALPixTile(tile: HEALPixTile): Promise<Texture> {
       // Use WWT's tile loading logic
       // But create Babylon.js texture
     }
   }
   ```

3. **Side-by-side with legacy engine:**
   - 2D mode: Keep existing engine
   - XR mode: Use Babylon.js
   - Shared astronomical data layer

**Benefits:**

- ✅ Modern stack for XR
- ✅ Legacy engine unchanged
- ✅ Learning path for team

---

### Phase 3: Consider Full Migration (12+ months)

**Decision point:** After XR launches

If XR with Babylon.js is successful:

- Evaluate migrating 2D engine to Babylon.js
- Better performance, maintainability
- But requires extensive testing

If staying with hybrid:

- Continue maintaining both engines
- Eventually phase out custom WebGL code

---

## Immediate Action Items

### 1. Proof of Concept: Math Library Swap

**Task:** Replace Vector3d with Babylon.js Vector3 in one small module

```typescript
// Before
import { Vector3d } from "./double3d.js";
const v = Vector3d.create(1, 2, 3);
const length = v.length();

// After
import { Vector3 } from "@babylonjs/core/Maths";
const v = new Vector3(1, 2, 3);
const length = v.length();
```

**Goal:** Validate compatibility and identify issues
**Effort:** 2-3 days
**Output:** Technical report on feasibility

---

### 2. Dependency Analysis

**Task:** Map all usages of custom math/graphics code

```bash
# Find all Vector3d usages
grep -r "Vector3d" engine/esm --include="*.js" | wc -l

# Find all Matrix3d usages
grep -r "Matrix3d" engine/esm --include="*.js" | wc -l
```

**Goal:** Understand migration scope
**Effort:** 1 day
**Output:** Dependency graph showing what depends on what

---

### 3. Babylon.js Integration Test

**Task:** Create standalone demo using Babylon.js + WWT astronomical data

```typescript
// demo: Render star field using Babylon.js
import { Engine, Scene } from "@babylonjs/core";
import { WWTControl } from "@wwtelescope/engine";

class BabylonWWTDemo {
  // Load WWT star catalog
  // Render as points in Babylon.js scene
  // Test XR session
}
```

**Goal:** Validate Babylon.js for astronomical rendering
**Effort:** 1 week
**Output:** Working prototype

---

## Cost-Benefit Analysis

| Component              | Current LOC | Potential Savings | Effort  | ROI      |
| ---------------------- | ----------- | ----------------- | ------- | -------- |
| **Math Library**       | ~1,500      | -1,000 LOC        | 3 weeks | ⭐⭐⭐⭐ |
| **Animation**          | ~300        | -200 LOC          | 2 weeks | ⭐⭐⭐   |
| **3D Primitives**      | ~600        | -400 LOC          | 4 weeks | ⭐⭐     |
| **Texture Management** | ~400        | -250 LOC          | 3 weeks | ⭐⭐⭐   |
| **UI/Input**           | ~300        | -200 LOC          | 2 weeks | ⭐⭐⭐⭐ |

**Total Potential Reduction:** ~2,000 lines of custom code
**Total Effort:** 14 weeks (3.5 months)
**Net Benefit:** Easier maintenance, better performance, XR-ready

---

## Recommendation

### For Current 2D Engine: Minimal Changes

1. ✅ Keep existing WebGL engine as-is
2. ✅ Focus on bug fixes and features
3. ✅ Don't introduce breaking changes

### For New XR Engine: Babylon.js from Start

1. ✅ Create `@wwtelescope/engine-xr` with Babylon.js
2. ✅ Use Babylon.js math, meshes, animations
3. ✅ Integrate WWT astronomical data layer
4. ✅ Modern, maintainable codebase for XR

### Gradual Convergence: Optional Future

- After XR ships, evaluate if 2D engine should migrate
- Could use Babylon.js for both 2D and XR
- But this is a 12+ month project
- Not required for XR launch

---

## Framework Comparison for WWT

| Framework            | Math Lib   | Animation  | XR Support | Size   | Verdict          |
| -------------------- | ---------- | ---------- | ---------- | ------ | ---------------- |
| **Babylon.js**       | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ~900KB | **BEST**         |
| **Three.js**         | ⭐⭐⭐⭐   | ⭐⭐⭐     | ⭐⭐⭐⭐   | ~600KB | Good alternative |
| **gl-matrix**        | ⭐⭐⭐⭐⭐ | ❌         | ❌         | 12KB   | Math only        |
| **Custom (current)** | ⭐⭐       | ⭐⭐       | ❌         | 0KB    | Legacy           |

**Babylon.js wins for WWT because:**

- Best WebXR/Vision Pro support
- Complete solution (not piecemeal)
- TypeScript-first
- Active development

---

## Questions to Discuss

1. **Risk tolerance:** Okay with incremental modernization or want clean break?
2. **Timeline:** Need XR in 3 months or can wait 6-12?
3. **Team size:** How many developers available for this work?
4. **2D engine fate:** Keep dual engines or eventually migrate to Babylon.js?
5. **Testing resources:** How much regression testing capacity?

Ready to start with a proof-of-concept?
