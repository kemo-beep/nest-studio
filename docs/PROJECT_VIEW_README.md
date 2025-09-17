# Project View - Visual Builder for Next.js

## Overview

The Project View is the core visual editing interface of Nest Studio, providing a comprehensive environment for building Next.js applications with drag-and-drop functionality, real-time editing, and seamless integration with the Next.js ecosystem.

## 🎯 Key Features

### 1. Project Explorer
- **Pages Tab**: Browse and edit Next.js App Router pages
- **Components Tab**: Manage custom components
- **Auto-detection**: Automatically finds pages and components
- **Hierarchical View**: Shows project structure clearly

### 2. Visual Canvas
- **Drag & Drop**: Drag components from library to canvas
- **Element Selection**: Click elements to select and edit
- **Visual Feedback**: Selected elements are highlighted
- **Real-time Updates**: Changes reflect immediately

### 3. Component Library
- **Shadcn/ui Components**: Complete catalog of UI components
- **Layout Components**: Row, Column, Stack, Grid, Container, Spacer
- **Search & Filter**: Find components quickly
- **Component Info**: See descriptions and dependencies

### 4. Properties Panel
- **Dynamic Props**: Edit component properties
- **Tailwind Classes**: Edit CSS classes with autocomplete
- **Layout Controls**: Flexbox, grid, positioning
- **Responsive Design**: Edit for different breakpoints

## 🚀 Getting Started

### 1. Open a Project
```bash
# Create a new Next.js project
npm run create-project

# Or import an existing project
npm run import-project
```

### 2. Navigate the Interface
- **Left Sidebar**: Project Explorer with Pages and Components
- **Center**: Canvas for visual editing
- **Right Sidebar**: Component Library and Properties Panel

### 3. Start Building
1. Select a page from the Pages tab
2. Drag components from the Component Library
3. Click elements to edit their properties
4. Use the Properties Panel to customize

## 📁 Project Structure

```
project/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Root page (auto-loaded)
│   ├── about/
│   │   └── page.tsx       # Nested pages
│   └── layout.tsx         # Root layout
├── components/             # Custom components
│   ├── ui/                # shadcn/ui components
│   ├── custom/            # Custom components
│   └── layout/            # Layout components
└── lib/                   # Utility functions
```

## 🧩 Component Library

### Shadcn/ui Components
- **Form**: Button, Input, Select, Checkbox, Radio Group, etc.
- **UI**: Card, Badge, Avatar, Progress, Skeleton, etc.
- **Navigation**: Breadcrumb, Navigation Menu, Pagination, etc.
- **Data**: Table, Data Table, Chart, etc.
- **Feedback**: Alert, Toast, Sonner, etc.
- **Overlay**: Dialog, Sheet, Popover, Tooltip, etc.

### Layout Components
- **Row**: Horizontal layout container
- **Column**: Vertical layout container
- **Stack**: Flexible stack container
- **Grid**: Grid layout container
- **Container**: Responsive container
- **Spacer**: Flexible spacer element

## 🎨 Visual Editing

### Element Selection
- Click any element to select it
- Selected elements show blue border and resize handles
- Properties panel updates with element details

### Drag & Drop
- Drag components from library to canvas
- Visual feedback during drag operation
- Components are positioned where dropped

### Property Editing
- **Props Tab**: Edit component properties
- **Styles Tab**: Edit Tailwind CSS classes
- **Layout Tab**: Edit flexbox and grid properties
- **Responsive Tab**: Edit for different breakpoints

## 🔧 Advanced Features

### Auto-loading
- Root `page.tsx` loads automatically when project opens
- Detects App Router vs Pages Router structure
- Handles both `app/` and `src/app/` directories

### File System Integration
- Real-time file watching
- Automatic project structure detection
- Seamless integration with external editors

### Responsive Design
- Mobile, tablet, and desktop previews
- Breakpoint-specific editing
- Responsive component properties

## 🎯 User Workflows

### 1. Creating a New Page
1. Right-click in Pages tab
2. Select "Create New Page"
3. Enter page name and route
4. Page opens in canvas for editing

### 2. Adding Components
1. Drag component from library to canvas
2. Click component to select it
3. Edit properties in Properties Panel
4. Component updates in real-time

### 3. Editing Layout
1. Select layout element (Row, Column, etc.)
2. Go to Layout tab in Properties Panel
3. Adjust flexbox or grid properties
4. See changes immediately in canvas

### 4. Styling Components
1. Select component
2. Go to Styles tab
3. Edit Tailwind classes
4. Use autocomplete for class suggestions

## 🔍 Troubleshooting

### Common Issues

#### Pages Not Loading
- Check if `app/page.tsx` exists
- Verify Next.js App Router structure
- Check console for errors

#### Components Not Dragging
- Ensure component library is open
- Check if canvas is ready
- Verify drag and drop is enabled

#### Properties Not Updating
- Select element first
- Check if Properties Panel is open
- Verify element is properly selected

### Debug Mode
```bash
# Enable debug logging
DEBUG=true npm run dev
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run specific test
npm test -- --grep "Project View"

# Run with coverage
npm run test:coverage
```

### Test Coverage
- Unit tests for all components
- Integration tests for file operations
- E2E tests for user workflows

## 📊 Performance

### Optimization
- Lazy loading of components
- Efficient file watching
- Optimized re-rendering
- Memory leak prevention

### Benchmarks
- App startup: < 3 seconds
- File sync: < 200ms
- UI interactions: < 100ms
- Memory usage: < 1GB

## 🔒 Security

### File System
- Sandboxed file access
- Path traversal prevention
- File type validation
- Permission checking

### Code Generation
- AST manipulation safety
- XSS prevention
- Input validation
- Output sanitization

## ♿ Accessibility

### Keyboard Navigation
- Full keyboard support
- Tab order management
- Focus indicators
- Keyboard shortcuts

### Screen Reader
- ARIA labels
- Semantic HTML
- Role attributes
- Live regions

### Visual Accessibility
- High contrast mode
- Scalable fonts
- Color blind support
- Motion reduction

## 🎨 Theming

### Dark Mode
- Automatic system detection
- Manual toggle
- Consistent theming
- Smooth transitions

### Custom Themes
- Color customization
- Font scaling
- Layout adjustments
- Component styling

## 📱 Mobile Support

### Touch Gestures
- Drag and drop
- Pinch to zoom
- Swipe navigation
- Touch-friendly controls

### Responsive Design
- Mobile-first approach
- Flexible layouts
- Scalable UI
- Touch targets

## 🔄 Updates

### Version History
- v1.0.0: Initial release
- v1.1.0: Added layout components
- v1.2.0: Enhanced properties panel
- v1.3.0: Improved accessibility

### Migration Guide
- Backward compatibility
- Breaking changes
- Upgrade instructions
- Migration tools

## 🤝 Contributing

### Development Setup
```bash
# Clone repository
git clone https://github.com/your-org/nest-studio

# Install dependencies
npm install

# Start development server
npm run dev
```

### Code Style
- ESLint configuration
- Prettier formatting
- TypeScript strict mode
- Component conventions

### Pull Requests
- Feature branches
- Code review process
- Testing requirements
- Documentation updates

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

### Documentation
- [User Guide](docs/USER_GUIDE.md)
- [API Reference](docs/API_REFERENCE.md)
- [Component Library](docs/COMPONENT_LIBRARY.md)

### Community
- [GitHub Issues](https://github.com/your-org/nest-studio/issues)
- [Discord Server](https://discord.gg/your-server)
- [Stack Overflow](https://stackoverflow.com/tags/nest-studio)

### Professional Support
- [Enterprise Support](https://your-org.com/support)
- [Consulting Services](https://your-org.com/consulting)
- [Training Programs](https://your-org.com/training)
