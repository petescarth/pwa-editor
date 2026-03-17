# PWA Text Editor

[![Deploy to GitHub Pages](https://github.com/petescarth/pwa-editor/actions/workflows/deploy.yml/badge.svg)](https://github.com/petescarth/pwa-editor/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Test URL:** [https://petescarth.github.io/pwa-editor/](https://petescarth.github.io/pwa-editor/)

A powerful, offline-capable text editor built as a Progressive Web App. Features syntax highlighting for 18+ languages, multiple tabs, find/replace, and works entirely in your browser with no server required.

## Features

- **Offline Support**: Works without internet connection after first load
- **Syntax Highlighting**: Support for JavaScript, TypeScript, Python, HTML, CSS, JSON, Markdown, SQL, Rust, Go, C/C++, and more
- **Multiple Tabs**: Open and edit multiple files simultaneously with drag-to-reorder
- **File System Access**: Open and save files directly from your computer (in supported browsers)
- **Find & Replace**: Search within documents with regex support
- **Command Palette**: Quick access to all commands (Ctrl+Shift+P)
- **Customizable**: Dark/light themes, adjustable font size, line numbers, word wrap
- **Auto-save**: Automatically persists your work to IndexedDB
- **Keyboard Shortcuts**: Full keyboard navigation support
- **Installable**: Install as a native-like app on desktop and mobile

## Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| New File | Ctrl+N | Cmd+N |
| Open File | Ctrl+O | Cmd+O |
| Save | Ctrl+S | Cmd+S |
| Save As | Ctrl+Shift+S | Cmd+Shift+S |
| Close Tab | Ctrl+W | Cmd+W |
| Find | Ctrl+F | Cmd+F |
| Find & Replace | Ctrl+H | Cmd+H |
| Go to Line | Ctrl+G | Cmd+G |
| Command Palette | Ctrl+Shift+P | Cmd+Shift+P |
| Next Tab | Ctrl+Tab | Cmd+Tab |
| Previous Tab | Ctrl+Shift+Tab | Cmd+Shift+Tab |
| Switch to Tab 1-9 | Ctrl+1-9 | Cmd+1-9 |

## Development

### Prerequisites

- Node.js 18 or later
- npm 9 or later

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type check
npm run typecheck

# Lint
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deploying to GitHub Pages

This project includes a GitHub Actions workflow for automatic deployment to GitHub Pages.

### Setup Instructions

1. **Push to GitHub**

   Create a new repository on GitHub and push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git branch -M main
   git push -u origin main
   ```

2. **Enable GitHub Pages**

   - Go to your repository on GitHub
   - Navigate to **Settings** > **Pages**
   - Under "Build and deployment", set **Source** to "GitHub Actions"

3. **Configure Base URL (if needed)**

   If deploying to `https://username.github.io/repo-name/` (not the root), update `vite.config.ts`:
   ```typescript
   export default defineConfig({
     base: '/repo-name/',
     // ... rest of config
   });
   ```

4. **Trigger Deployment**

   Push to the `main` branch to trigger automatic deployment:
   ```bash
   git push origin main
   ```

5. **Access Your Site**

   After the workflow completes, your site will be available at:
   - `https://USERNAME.github.io/REPO_NAME/` (for project sites)
   - `https://USERNAME.github.io/` (if repo is named `USERNAME.github.io`)

### Manual Deployment

To deploy manually without GitHub Actions:

```bash
# Build the project
npm run build

# The dist/ folder contains your static site
# Upload contents to any static hosting service
```

### Workflow Details

The included `.github/workflows/deploy.yml` workflow:

- Triggers on push to `main` branch
- Runs type checking and linting
- Builds the production bundle
- Deploys to GitHub Pages

## Supported Languages

| Language | Extensions |
|----------|------------|
| JavaScript | .js, .mjs, .cjs |
| TypeScript | .ts, .mts, .cts |
| JSX | .jsx |
| TSX | .tsx |
| Python | .py, .pyw, .pyi |
| HTML | .html, .htm, .xhtml |
| CSS | .css |
| JSON | .json, .jsonc |
| Markdown | .md, .markdown |
| SQL | .sql |
| YAML | .yaml, .yml |
| XML | .xml, .xsd, .xsl, .svg |
| Rust | .rs |
| C++ | .cpp, .cc, .cxx, .hpp, .h |
| C | .c |
| Go | .go |
| Shell | .sh, .bash, .zsh |
| TOML | .toml |

## Browser Support

- Chrome/Edge 86+ (full File System Access API support)
- Firefox 91+ (fallback file handling)
- Safari 15+ (fallback file handling)

## Tech Stack

- React 18
- TypeScript
- Vite
- CodeMirror 6
- Tailwind CSS
- IndexedDB (via idb)
- Workbox (PWA)

## License

MIT
