# Nest Studio

A visual builder for Next.js + Tailwind + shadcn/ui projects with live code sync.

## Features

- 🎨 **Visual Editor** - Drag and drop components, edit properties visually
- 🔄 **Live Preview** - See changes instantly with integrated Next.js dev server
- 📝 **Code Sync** - Bidirectional sync between visual editor and source code
- 🧩 **Component Library** - Built-in shadcn/ui component catalog
- 🎯 **Project Management** - Create new projects or import existing ones
- ⚡ **Real-time Updates** - File watching and hot reload
- 🎨 **Theme Support** - Light and dark mode
- 📱 **Responsive Design** - Preview on different screen sizes

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-org/nest-studio.git
cd nest-studio
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm run electron:dist
```

## Development

### Project Structure

```
src/
├── main/           # Electron main process
│   ├── main.ts
│   ├── preload.ts
│   └── services/   # Backend services
├── renderer/       # React app (renderer process)
│   ├── components/ # UI components
│   ├── contexts/   # React contexts
│   └── hooks/      # Custom hooks
└── shared/         # Shared types and utilities
    └── types/      # TypeScript type definitions
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run electron:pack` - Package the app
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Requirements Compliance

This project follows strict requirements validation as defined in `requirements.md`. All features are tested against:

- **Functional Requirements (FR-XXX)** - Core functionality
- **Non-Functional Requirements (NFR-XXX)** - Performance, reliability, usability
- **Technical Requirements (TR-XXX)** - Platform support, dependencies
- **Performance Requirements (PERF-XXX)** - Startup time, memory usage, sync latency
- **Security Requirements (SEC-XXX)** - File system security, code security
- **Accessibility Requirements (ACC-XXX)** - Keyboard navigation, visual accessibility

## Testing

### Running Tests

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Requirements validation
npm run validate-requirements
```

### Test Coverage

- Unit tests for all components and services
- Integration tests for file system operations
- E2E tests for complete user workflows
- Performance tests for startup and runtime
- Accessibility tests for WCAG compliance

## Architecture

### Electron Main Process
- File system operations
- Next.js dev server management
- Project detection and creation
- IPC communication with renderer

### Electron Renderer Process
- React-based UI
- Visual editor and canvas
- Component library
- Properties panel
- Live preview

### Code Sync Engine
- AST-based code manipulation
- Bidirectional file watching
- Real-time sync between UI and files
- Conflict resolution

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and ensure all requirements are met
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- Documentation: [docs.neststudio.dev](https://docs.neststudio.dev)
- Issues: [GitHub Issues](https://github.com/your-org/nest-studio/issues)
- Discussions: [GitHub Discussions](https://github.com/your-org/nest-studio/discussions)
