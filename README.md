# Datagrid Workbench

An interactive data grid workbench built with [Lumino](https://github.com/jupyterlab/lumino) widgets, showcasing advanced data grid capabilities across multiple specialized panels with live-updating data, custom renderers, and real-time performance monitoring.

## Quick Start

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Compile TypeScript and bundle for production |
| `npm run preview` | Preview the production build |
| `npm test` | Run unit and integration tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate test coverage report |
| `npm run test:e2e` | Run Playwright end-to-end tests |
| `npm run test:all` | Run all tests (unit + integration + e2e) |

## Panels

The workbench includes eight data grid panels arranged in a dockable layout:

- **Extreme Virtualization** — Performance testing with massive datasets
- **Streaming Rows** — Dynamic row insertion and removal
- **Random Ticks (Numeric)** — Live-updating numeric data with custom renderer
- **Random Ticks (Heat Map)** — Live-updating data with heat map visualization
- **Structured Records** — Realistic employee records with validation
- **Editable Grid** — In-place cell editing with validation
- **Copy Grid** — Copy-to-clipboard support
- **Merged Cells** — Cell merging demonstration

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Pause / Resume |
| `Ctrl+Shift+T` | Toggle theme (light/dark) |
| `Ctrl+Shift+H` | Toggle HUD overlay |
| `Ctrl+Shift+R` | Reset layout |
| `Ctrl+C` | Copy selection |
| `Enter` | Commit edit |
| `Escape` | Cancel edit / Close help |

## Project Structure

```
src/
├── main.ts              # App entry point and command registry
├── app-shell.ts         # Main shell layout
├── dock-manager.ts      # Panel layout management
├── toolbar.ts           # Toolbar controls
├── timer-manager.ts     # Global timer for live updates
├── panels/              # 8 specialized grid panel components
├── models/              # Data models extending Lumino DataModel
├── renderers/           # Custom cell renderers (numeric, heat map)
├── data/                # Column schemas and data generators
├── hud/                 # FPS counter and performance metrics overlay
└── styles/              # CSS (themes, toolbar, HUD, reset)

tests/
├── unit/                # Vitest unit tests
├── integration/         # Integration tests
└── e2e/                 # Playwright browser tests
```

## Tech Stack

- **TypeScript** + **Vite**
- **Lumino** — widget toolkit, command registry, signals, data grid
- **Vitest** — unit and integration testing
- **Playwright** — end-to-end testing
