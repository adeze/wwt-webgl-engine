# GitHub Copilot Instructions

## Project Overview

WorldWide Telescope (WWT) WebGL engine monorepo - a JavaScript/TypeScript framework for web-based astronomical visualization. The codebase originated from C# (WWT Windows Client) and was transpiled via ScriptSharp, so the structure closely tracks the original C# architecture.

## Package Manager & Build System

**Always use Yarn 4.5.3** - specified in `package.json` via `packageManager` field. This is a Yarn workspaces monorepo with 11 packages using `workspace:*` protocol for internal dependencies. Node.js version pinned to 22.12.0 LTS in `.nvmrc`.

Key commands from monorepo root:

- `yarn build` - Builds all packages in topological order
- `yarn workspaces foreach -vt run <script>` - Run script across all packages
- Navigate to package dir and run `yarn build|lint|test|clean` for individual packages

## Architecture & Dependencies

### Package Dependency Chain (build order matters)

1. `@wwtelescope/astro` - Basic astronomical calculations
2. `@wwtelescope/engine-types` - TypeScript type definitions
3. `@wwtelescope/engine` - **Core WebGL rendering engine** (ES6 modules from ScriptSharp transpilation)
4. `@wwtelescope/engine-helpers` - TypeScript wrappers around engine
5. `@wwtelescope/engine-pinia` - Engine wrapped as Vue 3/Pinia store (supersedes deprecated `engine-vuex`)
6. Applications: `embed-common`, `embed`, `embed-creator`, `research-app`, `research-app-messages`, `ui-components`

### Critical Technical Details

**Engine Core (`engine/esm/`)**: Pure ES6 JavaScript modules closely tracking original C# structure. Entry point `engine/esm/index.js` exports in dependency order with circular references. Key subsystems:

- `astrocalc/` - Astronomical calculations
- `graphics/` - WebGL rendering (shaders, textures, blend states)
- `layers/` - FITS images, orbits, spreadsheets, VO tables
- Type definitions in `engine/src/index.d.ts`

**Build Tools**:

- Engine: webpack (dev/prod modes) outputting UMD bundle as `wwtlib`
- Vue apps: Vue CLI service
- All packages use TypeScript with composite project references
- TSConfig uses `"composite": true`, `"references": []` for incremental builds, and modern `"moduleResolution": "bundler"`
- ESLint uses flat config format (`eslint.config.js`)

**Vue Dependency Issue**: `engine-pinia` must depend directly on Vue for types, but this causes webpack to bundle two Vue copies. Fixed via webpack alias in `vue.config.js`:

```javascript
resolve: {
  alias: {
    vue$: path.resolve("../node_modules/vue/dist/vue.runtime.esm-bundler.js");
  }
}
```

## Development Workflows

### Initial Setup

```bash
git submodule update --init
yarn install
```

### Serve Applications

- `yarn run serve-embed` - Port 8080
- `yarn run serve-research` - Port 8080
- `yarn run serve-creator` - Embed on 23000, creator on 8080

### Integration Testing

```bash
yarn run serve-research &  # Start app in background
cd tests
yarn build
yarn local                 # ChromeDriver locally
yarn bs-local              # BrowserStack (requires credentials)
yarn bs-local -e firefox,edge  # Multi-browser testing
```

Test stack: Nightwatch + Selenium + mocha/chai. URLs default to `http://localhost:8080`.

### Documentation

Built with Zola static site generator + TypeDoc:

```bash
yarn doc                   # Generate TypeDoc API docs into docs/engine/static/apiref
cd docs/engine
zola build                 # Build HTML to docs/engine/public/
zola serve                 # Local preview with autoreload
zola check                 # Check for broken links
```

## Project-Specific Conventions

### ES6 Module Structure

Engine modules use ES6 exports extensively. `engine/esm/index.js` re-exports types in dependency order but has circular references - this is intentional and matches original C# architecture.

### TypeScript Composite Projects

All `tsconfig.json` files use `"composite": true` with project references for incremental builds. When adding dependencies between packages, update the `references` array.

### Workspace Version Management

Internal dependencies use `workspace:0.0.0-dev.0` but have `internalDepVersions` field in `package.json` tracking actual commit hashes for Cranko release automation.

### Naming Conventions

Many legacy names from C# transpilation remain (e.g., `ss`, `Util`, abbreviated class names like `COR`, `CT`, `ASEP`). Preserve these for compatibility.

### Linting

ESLint with TypeScript extensions using modern flat config format (`eslint.config.js`). Embed app disables `lintOnSave` in `vue.config.js` due to large transpiled file size.

## Known Issues & Gotchas

- **Node.js 18.17**: Builds may fail with Invalid URL errors ([Node.js #48855](https://github.com/nodejs/node/issues/48855))
- **Node.js 20.x on Linux**: Reports of builds hanging
- **Engine source**: `engine/esm/` contains the actual source; `engine/src/` has webpack output and type definitions
- **Deprecated packages**: `engine-vuex` superseded by `engine-pinia` - use Pinia for new work

## CI/CD

Uses [Cranko](https://pkgw.github.io/cranko/) for automated releases. Azure Pipelines in `ci/` directory:

- Triggers on `master` and `rc` branches
- Stages: Prep → MainBuild → Deploy (skip deploy for PRs)
- Release branch: `rc` triggers production deployment

## Integration Points

- **WebGL Context**: Managed through `render_context.js` - central coordination point
- **Pinia Store**: `engine-pinia/src/store.ts` wraps engine as `WWTGlobalState` class
- **Vue 3**: Apps use Vue 3 + Pinia (not Vuex) + Vue CLI
- **External Data**: FITS images, WTML collections, tour files loaded through layers system
