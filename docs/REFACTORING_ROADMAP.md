# WWT Refactoring Roadmap

## ✅ Completed (Phase 1a)

### Math Library Modernization

- **Status:** COMPLETE
- **Duration:** 1 week
- **LOC Reduced:** ~1,800 lines (78% reduction from potential 2,327)
- **Modules Created:**
  - `engine-xr/src/math/BabylonMath.ts` - Core math exports
  - `engine-xr/src/math/WWTCompat.ts` - Legacy compatibility layer
  - `engine-xr/src/math/AstroMath.ts` - Astronomical utilities
  - `engine-xr/src/examples/StarfieldExample.ts` - Usage examples

### Animation System Foundation

- **Status:** COMPLETE
- **Duration:** 1 day
- **Modules Created:**
  - `engine-xr/src/animation/CameraAnimator.ts` - Babylon.js-based animation

## 🚀 Next Steps (Prioritized)

### Phase 1b: Animation System Complete (1-2 weeks)

**Goal:** Replace WWT's ViewMover with modern Babylon.js animation system

**Tasks:**

1. ✅ Create `CameraAnimator` class (DONE)
2. ⏳ Create animation examples
3. ⏳ Test with tour files
4. ⏳ Add keyframe animation support
5. ⏳ Integrate with WWTIntegration layer

**Files to Create:**

```
engine-xr/src/animation/
├── CameraAnimator.ts           ✅ DONE
├── KeyframeAnimator.ts         ⏳ TODO
├── TourAnimationAdapter.ts     ⏳ TODO
└── examples/
    └── AnimationExamples.ts    ⏳ TODO
```

**Benefits:**

- Replace ~300 lines of custom interpolation code
- Multiple easing functions (linear, ease-in/out, exponential, cubic)
- Spherical interpolation (slerp) for smooth astronomical camera motion
- Animation chaining for complex tour sequences
- Better performance with Babylon.js optimizations

---

### Phase 2: Input & Event System (2 weeks)

**Goal:** Modernize input handling for XR controllers, multi-touch, and gestures

**Current Issues:**

- `engine/esm/util.js` - Custom Mouse class with legacy event handling
- No multi-touch gesture support
- No XR controller integration
- Manual coordinate transformations

**Replacement:**

- Babylon.js `Scene.pointerObservable` for unified input
- Support mouse, touch, pen, XR controllers
- Built-in raycasting/picking
- Gesture recognition (pinch, rotate, swipe)

**Tasks:**

1. Create `InputManager` using Babylon.js pointer system
2. Add multi-touch gesture detection
3. Integrate XR controller input
4. Create backward-compatible adapter for legacy code
5. Test on desktop, mobile, Vision Pro

**Files to Create:**

```
engine-xr/src/input/
├── InputManager.ts              - Unified input system
├── GestureRecognizer.ts         - Multi-touch gestures
├── XRControllerInput.ts         - VR/AR controller handling
└── WWTInputAdapter.ts           - Legacy compatibility
```

**Benefits:**

- Unified event API across all input devices
- Better multi-touch on iPad/tablets
- Apple Pencil support
- WebXR controller integration ready
- ~200-300 lines of code reduction

---

### Phase 3: Testing Infrastructure (1 week)

**Goal:** Add comprehensive test coverage before deeper refactoring

**Tasks:**

1. Set up testing framework (Jest or Vitest)
2. Unit tests for math utilities
3. Unit tests for animation system
4. Integration tests for WWTCompat layer
5. Set up CI/CD pipeline

**Test Coverage:**

- Math conversions (WWT ↔ Babylon.js)
- Astronomical coordinate transformations
- Animation interpolation accuracy
- Input event handling
- Performance benchmarks

**Files to Create:**

```
engine-xr/
├── vitest.config.ts
└── tests/
    ├── math/
    │   ├── BabylonMath.test.ts
    │   ├── WWTCompat.test.ts
    │   └── AstroMath.test.ts
    ├── animation/
    │   └── CameraAnimator.test.ts
    └── benchmarks/
        └── math-performance.bench.ts
```

---

### Phase 4: 3D Primitives (3-4 weeks) - OPTIONAL

**Goal:** Replace custom line/triangle rendering with Babylon.js meshes

**Current:**

- `engine/esm/graphics/primitives3d.js` - 930 lines
- Manual vertex buffer management
- Custom drawing routines
- No hardware instancing

**Replacement:**

- Babylon.js `LinesMesh`, `GreasedLineMesh`
- Hardware instanced rendering
- Automatic frustum culling
- LOD support

**Benefits:**

- Better performance for constellation lines
- Reduced code maintenance
- Modern rendering features
- ~600 lines reduction

**Risk:** MEDIUM - affects rendering pipeline
**Priority:** LOWER (only if committed to full Babylon.js migration)

---

### Phase 5: Texture Management (2-3 weeks) - OPTIONAL

**Goal:** Use Babylon.js texture system for modern formats and compression

**Current:**

- `engine/esm/graphics/texture.js` - custom texture loading
- Manual WebGL texture creation
- Limited format support

**Replacement:**

- Babylon.js Texture system
- Modern formats (WebP, AVIF, KTX2)
- GPU compression (Basis Universal)
- Streaming texture loading

**Benefits:**

- Better memory management
- Modern format support
- Reduced code complexity
- ~400 lines reduction

---

## Timeline Overview

```
┌─────────────────────────────────────────────────────────────┐
│ Month 1                                                     │
├─────────────────────────────────────────────────────────────┤
│ Week 1-2: Complete Animation System                        │
│ Week 3: Testing Infrastructure                             │
│ Week 4: Input System (Part 1)                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Month 2                                                     │
├─────────────────────────────────────────────────────────────┤
│ Week 1: Input System (Complete)                            │
│ Week 2-3: Documentation & Examples                         │
│ Week 4: Code Review & Stabilization                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Month 3+ (Optional)                                         │
├─────────────────────────────────────────────────────────────┤
│ 3D Primitives Migration (if desired)                       │
│ Texture System Migration (if desired)                      │
│ Performance Optimization                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Decision Points

### Should we continue to Phase 4 (3D Primitives)?

**YES if:**

- ✅ You want full Babylon.js integration
- ✅ Performance is critical (need hardware instancing)
- ✅ Planning extensive XR features

**NO if:**

- ❌ Current rendering performance is acceptable
- ❌ Want to minimize risk/effort
- ❌ Prefer incremental approach

### Should we continue to Phase 5 (Textures)?

**YES if:**

- ✅ Need modern texture formats (WebP, AVIF)
- ✅ Memory usage is a concern
- ✅ Want GPU texture compression

**NO if:**

- ❌ Current texture system works fine
- ❌ Limited development resources
- ❌ Risk-averse approach preferred

---

## Immediate Action Items

### This Week

1. ✅ Complete `CameraAnimator` implementation
2. ⏳ Create animation examples
3. ⏳ Test animation with existing WWT tours
4. ⏳ Document animation API

### Next Week

1. ⏳ Set up testing framework
2. ⏳ Write unit tests for math & animation
3. ⏳ Start InputManager design
4. ⏳ Research Babylon.js pointer observable API

### Next Month

1. ⏳ Complete input system
2. ⏳ Integration testing
3. ⏳ Performance benchmarking
4. ⏳ Developer documentation

---

## Success Metrics

### Code Quality

- [ ] Test coverage > 80%
- [ ] No regressions in existing features
- [ ] All TypeScript strict mode enabled
- [ ] ESLint passing with no warnings

### Performance

- [ ] Animation frame rate: 60 FPS consistent
- [ ] Input latency: < 16ms
- [ ] Memory usage: No leaks over 10 min session
- [ ] Bundle size: No increase > 5%

### Developer Experience

- [ ] Clear API documentation
- [ ] Working code examples
- [ ] Migration guide for legacy code
- [ ] CI/CD pipeline running

---

## Risk Mitigation

### Technical Risks

1. **Babylon.js compatibility issues**
   - Mitigation: Comprehensive testing, maintain compatibility layer
2. **Performance regressions**

   - Mitigation: Benchmarking, profiling before/after

3. **Breaking changes to existing code**
   - Mitigation: Maintain backward compatibility adapters

### Project Risks

1. **Scope creep**

   - Mitigation: Stick to phased approach, clear decision points

2. **Resource constraints**

   - Mitigation: Phases 4-5 are optional, focus on high-value items

3. **Adoption resistance**
   - Mitigation: Clear documentation, examples, gradual rollout

---

## Recommendation

**Proceed with Phases 1-3** (Animation + Input + Testing)

- Low risk, high value
- 2-3 months effort
- Sets foundation for future work
- Can stop here with significant improvements

**Defer Phases 4-5** (3D Primitives + Textures) until:

- Phases 1-3 complete and stable
- Clear business need emerges
- Resources available for 2-3 month effort

This approach maximizes value while minimizing risk. ✅
