# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the WorldWide Telescope (WWT) WebGL engine monorepo - a JavaScript/TypeScript framework that powers web-based astronomical visualization software. The codebase originated from C# (WWT Windows Client) and was transpiled via ScriptSharp, so the structure closely tracks the original C# architecture.

**Node.js Version**: Pinned to 22.12.0 LTS in `.nvmrc`

## Essential Commands

### Initial Setup
```bash
git submodule update --init
yarn install
```

### Build & Development
```bash
yarn build              # Build all packages in the monorepo
yarn lint               # Run ESLint across all packages
yarn test               # Run tests (mocha/chai) across packages
yarn clean              # Remove all build artifacts
yarn doc                # Generate TypeDoc API documentation
```

### Serve Web Applications
```bash
yarn run serve-embed           # Serve embed app (default port 8080)
yarn run serve-research        # Serve research app (default port 8080)
yarn run serve-creator         # Serve creator app (embed port 23000, creator port 8080)
```

### Package-Specific Commands
Navigate to any package directory (e.g., `cd engine`) and run:
- `yarn build` - Build that specific package
- `yarn lint` - Lint that specific package
- `yarn test` - Test that specific package
- `yarn clean` - Clean that specific package

### Integration Testing
```bash
yarn run serve-research &  # Start research app
cd tests
yarn build
yarn local                 # Run tests with ChromeDriver
yarn bs-local             # Run tests via BrowserStack (requires credentials)
yarn bs-local -e firefox,edge  # Test multiple browsers
```

## Monorepo Architecture

This is a Yarn workspaces monorepo with the following key packages:

### Core Packages (dependency order)
1. **`@wwtelescope/astro`** (`astro/`) - Basic astronomical calculation routines
2. **`@wwtelescope/engine-types`** (`engine-types/`) - TypeScript type definitions
3. **`@wwtelescope/engine`** (`engine/`) - Core WebGL rendering engine
   - Written in ES6 JavaScript modules derived from ScriptSharp transpilation
   - Closely mirrors original C# codebase structure
   - Main entry: `engine/esm/index.js`
   - Type definitions: `engine/src/index.d.ts`
   - Built with webpack (dev and prod modes)
4. **`@wwtelescope/engine-helpers`** (`engine-helpers/`) - Convenience TypeScript wrappers around engine

### State Management
5. **`@wwtelescope/engine-pinia`** (`engine-pinia/`) - Engine wrapped as Vue 3/Pinia module
   - Supersedes the deprecated `engine-vuex` package
   - Built with Vue CLI service as a library
   - Provides `WWTGlobalState` class and Pinia store integration

### Application Packages
6. **`@wwtelescope/embed-common`** (`embed-common/`) - Shared utilities for embed apps
7. **`@wwtelescope/embed`** (`embed/`) - Embeddable iframe viewer application
8. **`@wwtelescope/embed-creator`** (`embed-creator/`) - UI for creating embed iframe code
9. **`@wwtelescope/research-app`** (`research-app/`) - Full research application for astrophysics
10. **`@wwtelescope/research-app-messages`** (`research-app-messages/`) - Messaging for research app
11. **`@wwtelescope/ui-components`** (`ui-components/`) - Reusable UI components

### Other
- **`@wwtelescope/tests`** (`tests/`) - Integration tests using Nightwatch/Selenium/BrowserStack

## Key Technical Details

### Package Manager

- Uses **Yarn 4.5.3** (specified in `package.json` via `packageManager` field)
- All workspace packages use `workspace:*` protocol for internal dependencies
- Yarn path configured in `.yarnrc.yml` pointing to `.yarn/releases/yarn-4.5.3.cjs`

### Build System

- TypeScript ~4.8.4 across all packages
- All `tsconfig.json` files use `"composite": true` with project references for incremental builds
- TSConfig uses modern `"moduleResolution": "bundler"`
- Engine uses webpack for bundling
- Vue apps use Vue CLI service
- ESLint uses modern flat config format (`eslint.config.js`) with TypeScript extensions

### Node.js Compatibility

- **Current version**: Node.js 22.12.0 LTS (specified in `.nvmrc`)
- **Previous issues**: Builds around Node.js 18.17 may fail with Invalid URL errors
- **Previous issues**: Reports of builds hanging on Linux with Node 20.x

### Source Code Structure

- **Engine core** (`engine/esm/`): ES6 modules closely tracking original C# structure
  - `astrocalc/` - Astronomical calculation modules
  - `graphics/` - WebGL rendering primitives, shaders, textures
  - `layers/` - Layer system (FITS images, orbits, spreadsheets, VO tables, etc.)
  - Main exports in `index.js` follow rough dependency order with circular refs
  - Type definitions in `engine/src/index.d.ts`
- **Pinia store** (`engine-pinia/src/store.ts`): Defines Pinia store wrapping engine as `WWTGlobalState` class
  - Supersedes deprecated `engine-vuex` package
  - Must depend directly on Vue for types, but this causes webpack to bundle two Vue copies
  - Fixed via webpack alias in `vue.config.js` to resolve Vue from shared node_modules
- **Apps**: Vue 3 applications consuming engine via Pinia

### Documentation

- Narrative docs in `docs/` subdirectories
- Built with Zola static site generator
- API docs generated via TypeDoc into `docs/engine/static/apiref`
- Run `yarn doc` from monorepo root to generate TypeDoc API documentation
- Run `zola build` in a docs subdirectory to generate HTML
- Run `zola serve` for local preview with autoreload
- Run `zola check` to check for broken links

### CI/CD

- Uses Cranko for release automation
- Azure Pipelines configuration in `ci/` directory
- Triggers on `master` and `rc` branches
- Stages: Prep → MainBuild → Deploy (skip deploy for PRs)
- Release branch: `rc` triggers production deployment

### Testing

- Unit tests: mocha + chai + mocha-headless-chrome
- Integration tests: Nightwatch + Selenium
- BrowserStack integration for multi-browser testing
- Test URLs default to `http://localhost:8080`

## Project-Specific Conventions

### Legacy C# Architecture

- Many legacy names from C# transpilation remain (e.g., `ss`, `Util`, abbreviated class names like `COR`, `CT`, `ASEP`)
- Preserve these for compatibility with original codebase structure
- Engine modules use ES6 exports extensively with intentional circular references matching original C# architecture

### TypeScript Composite Projects

- All `tsconfig.json` files use `"composite": true` with project references for incremental builds
- When adding dependencies between packages, update the `references` array in `tsconfig.json`

### Workspace Version Management

- Internal dependencies use `workspace:*` protocol
- Some packages may have `internalDepVersions` field in `package.json` tracking actual commit hashes for Cranko release automation

### Linting

- ESLint uses modern flat config format (`eslint.config.js`)
- Configuration uses TypeScript ESLint with recommended rules
- Unused variables with `_` prefix are allowed (e.g., `_unusedParam`)
- Some apps like embed may disable `lintOnSave` in `vue.config.js` due to large transpiled file size

## Known Issues & Gotchas

- **Engine source location**: `engine/esm/` contains the actual source; `engine/src/` has webpack output and type definitions
- **Deprecated packages**: `engine-vuex` superseded by `engine-pinia` - use Pinia for new work
- **Vue bundling**: `engine-pinia` must depend directly on Vue for types, which can cause webpack to bundle two Vue copies. Fixed via webpack alias in `vue.config.js`
- **Old ESLint config**: Project has migrated to flat config (`eslint.config.js`), old `.eslintrc.js` may still exist but is not used
