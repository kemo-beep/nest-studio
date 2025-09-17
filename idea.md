# Nest Studio - Visual Builder for Next.js

A desktop visual builder for Next.js + Tailwind + shadcn/ui projects with live code sync. Think of it like a mix of Webflow, Figma, and VSCode, but specifically tailored for the modern React + Tailwind + App Router stack.

## 🎯 Core Idea

An offline desktop app (built with Electron) that lets users:

- **Create a new Next.js project** with Tailwind + shadcn/ui pre-configured
- **Import existing Next.js projects** from disk with automatic package detection and configuration sync
- **Preview the app** in a live browser-like panel (similar to `next dev`)
- **Visually edit layouts and components**: drag, resize, adjust Tailwind classes, switch shadcn/ui component props
- **Bidirectional code sync**: Changes in the visual editor reflect in source files (e.g., `.tsx`), and code edits in the project folder reflect back in the editor (via file watcher)

## 🚀 Features Breakdown

### 🏗️ Project Setup
- **"Create New Project" wizard**
  - Choose Next.js version (13+, 14+, 15+)
  - TypeScript/JavaScript selection
  - App Router vs Pages Router
  - Tailwind CSS configuration
  - shadcn/ui component library setup
  - ESLint, Prettier, and other dev tools
- **"Import Existing Project"**
  - Auto-detect installed packages and versions
  - Sync configuration files (next.config.js, tailwind.config.js, etc.)
  - Validate project structure compatibility
  - Detect and integrate existing shadcn/ui components
  - Preserve existing code structure and customizations
  - Support both App Router and Pages Router projects

### 🎨 Component & Layout Editing
- **Component library browser**
  - Complete shadcn/ui component catalog
  - Search and filter components
  - Preview components with different variants
  - Custom component detection and import
- **Visual drag-and-drop interface**
  - Drag components from library to canvas
  - Resize and reposition elements
  - Snap to grid and alignment guides
- **Advanced side panel editor**
  - **Props editor**: Visual form for component props (e.g., `variant="outline"` on Button)
  - **Tailwind classes editor**: Autocomplete, validation, and live preview
  - **Layout properties**: Flexbox, Grid, positioning, spacing
  - **Responsive design**: Breakpoint-specific styling
  - **Theme customization**: Colors, fonts, spacing scales

### ⚡ Code Sync Engine
- **AST-based parser** (Babel/Recast/TSMorph) for safe JSX manipulation
- **Preserve code formatting** and comments during modifications
- **File watcher integration** → auto-refresh preview when user edits code externally
- **Real-time bidirectional sync** → UI changes rewrite `.tsx` files instantly
- **Conflict resolution** for simultaneous edits
- **Undo/redo functionality** with full state management

### 🖥️ Preview & Dev Server
- **Embedded Next.js dev server** running in background process
- **Live preview window** with hot reload and error overlay
- **Multiple viewport sizes** (mobile, tablet, desktop)
- **Dark/light mode toggle** for preview
- **Console integration** for debugging
- **Network tab** for API calls and performance monitoring

### 📦 Component Management
- **Create new components** with proper file structure (`/components/Button.tsx`)
- **Visual component editor** with live preview
- **Component library organization** (group by category, custom collections)
- **Design system management** (tokens, variants, documentation)
- **Import/export components** between projects
- **Component versioning** and change tracking

### 🔄 Advanced Features
- **Offline-first architecture** (no cloud requirement)
- **Git integration** (commit, push, pull changes)
- **Deployment pipelines** (Vercel, Netlify, Coolify integration)
- **Project templates** and starter kits
- **Plugin system** for extending functionality
- **Team collaboration** (future: real-time editing)

## 🛠 Tech Stack for the App

### Frontend (Electron Main Process)
- **Electron** - Cross-platform desktop app framework
- **Node.js** - Runtime for file system operations and dev server management

### Frontend (Electron Renderer Process)
- **React 18** - UI framework with concurrent features
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations and transitions
- **React DnD** - Drag and drop functionality
- **React Query** - State management and caching

### Code Editing & Parsing
- **Monaco Editor** - VSCode's editor for inline code editing
- **@babel/parser** - JavaScript/TypeScript parsing
- **@babel/traverse** - AST traversal and manipulation
- **recast** - Code formatting preservation
- **ts-morph** - TypeScript AST manipulation

### Development Tools
- **Next.js dev server** - Child process for live preview
- **chokidar** - File system watching
- **ws** - WebSocket for real-time communication
- **commander** - CLI argument parsing
- **inquirer** - Interactive command line prompts

### Build & Distribution
- **Vite** - Fast build tool and dev server
- **electron-builder** - App packaging and distribution
- **electron-updater** - Auto-update functionality

## 📝 Project Workflow

### Importing Existing Next.js Project

1. **Open Nest Studio** and select "Import Existing Project"
2. **Browse to project directory** containing your Next.js app
3. **Auto-detection process**:
   - Scans `package.json` for dependencies
   - Detects Next.js version and configuration
   - Identifies App Router vs Pages Router structure
   - Checks for Tailwind CSS and shadcn/ui setup
4. **Configuration sync**:
   - Imports `next.config.js` settings
   - Syncs `tailwind.config.js` configuration
   - Detects existing shadcn/ui components
   - Preserves custom configurations
5. **Start visual editing** with your existing codebase

### Creating Project from Scratch

1. **Initialize Next.js project**
   ```bash
   npx create-next-app@latest my-project --typescript --tailwind --eslint --app
   cd my-project
   ```

2. **Setup shadcn/ui**
   ```bash
   npx shadcn@latest init
   npx shadcn@latest add button card input
   ```

3. **Configure project structure**
   ```
   src/
   ├── app/
   │   ├── globals.css
   │   ├── layout.tsx
   │   └── page.tsx
   ├── components/
   │   ├── ui/          # shadcn/ui components
   │   └── custom/      # custom components
   ├── lib/
   │   └── utils.ts
   └── types/
       └── index.ts
   ```

4. **Page creation script**
   ```bash
   # Create new page: about
   mkdir -p src/app/about
   touch src/app/about/page.tsx
   ```

5. **Development workflow**
   - Open Nest Studio
   - Load project or create new one
   - Start visual editing
   - Code syncs automatically
   - Deploy when ready

## 🎯 Target Users

- **Frontend developers** who want faster prototyping
- **Designers** transitioning to code
- **Startups** needing rapid MVP development
- **Agencies** building multiple client projects
- **Students** learning modern React development

## 🚀 Competitive Advantages

- **Next.js specific** - Not generic, optimized for the stack
- **Offline-first** - No internet required for development
- **Real code generation** - Not just mockups, actual working code
- **shadcn/ui integration** - Built-in component library
- **Bidirectional sync** - Edit visually or in code
- **Modern stack** - App Router, TypeScript, Tailwind CSS

## 📈 Future Roadmap

### Phase 1 (MVP)
- [ ] Basic Electron app setup
- [ ] Project creation wizard
- [ ] Simple drag-and-drop interface
- [ ] Basic component editing
- [ ] File watching and sync

### Phase 2 (Enhanced)
- [ ] Advanced component library
- [ ] Responsive design tools
- [ ] Theme customization
- [ ] Git integration
- [ ] Plugin system

### Phase 3 (Collaboration)
- [ ] Real-time collaboration
- [ ] Cloud sync
- [ ] Team management
- [ ] Deployment pipelines
- [ ] Analytics and insights

---

*This document serves as the foundation for building Nest Studio - a revolutionary tool for modern React development.*