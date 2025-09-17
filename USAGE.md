# 🚀 Nest Studio - Usage Guide

Welcome to **Nest Studio**, the visual builder for Next.js + Tailwind + shadcn/ui projects! This guide will help you get started and make the most of all the features.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Project Management](#project-management)
- [Visual Editor](#visual-editor)
- [Component Library](#component-library)
- [Properties Panel](#properties-panel)
- [Live Preview](#live-preview)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Troubleshooting](#troubleshooting)
- [Advanced Features](#advanced-features)

## 🚀 Getting Started

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd nest-studio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the application:**
   ```bash
   npm run build
   ```

4. **Start the app:**
   ```bash
   npm run electron
   ```

### First Launch

When you first open Nest Studio, you'll see the **Welcome Screen** with two main options:

- **Create New Project** - Start a fresh Next.js project
- **Import Existing Project** - Load an existing Next.js project

## 📁 Project Management

### Creating a New Project

1. Click **"Create New Project"** on the welcome screen
2. Fill out the project wizard:
   - **Project Name**: Choose a name for your project
   - **Directory**: Select where to create the project
   - **Next.js Version**: Choose 13+, 14+, or 15+
   - **TypeScript**: Enable/disable TypeScript support
   - **App Router**: Choose between App Router or Pages Router
   - **Tailwind CSS**: Enable/disable Tailwind CSS
   - **shadcn/ui**: Enable/disable shadcn/ui components
   - **ESLint & Prettier**: Enable code quality tools

3. Click **"Create Project"** to generate your project

### Importing an Existing Project

1. Click **"Import Existing Project"** on the welcome screen
2. Click **"Browse"** to select your project directory
3. Nest Studio will automatically detect:
   - Next.js version
   - TypeScript support
   - App Router vs Pages Router
   - Tailwind CSS configuration
   - shadcn/ui setup
   - ESLint and Prettier configuration
4. Click **"Import Project"** to load your project

## 🎨 Visual Editor

### Canvas Overview

The main canvas is where you'll build your interface visually:

- **Grid Overlay**: Helps with alignment and spacing
- **Drag & Drop**: Drag components from the sidebar to the canvas
- **Selection**: Click on elements to select them
- **Resize Handles**: Drag the corners/edges to resize selected elements
- **Multi-select**: Hold Ctrl/Cmd and click multiple elements

### Viewport Controls

- **Mobile View**: Preview on mobile screen size
- **Tablet View**: Preview on tablet screen size  
- **Desktop View**: Preview on desktop screen size
- **Zoom Controls**: Zoom in/out for detailed editing

### Canvas Operations

- **Add Element**: Drag from component library
- **Move Element**: Click and drag selected elements
- **Resize Element**: Use resize handles on selected elements
- **Delete Element**: Select and press Delete key
- **Duplicate Element**: Select and press Ctrl/Cmd + D

## 📚 Component Library

### Available Components

The component library includes:

- **Layout Components**: Container, Grid, Flex, Stack
- **UI Components**: Button, Input, Card, Modal, Dialog
- **Navigation**: Header, Footer, Sidebar, Breadcrumb
- **Form Components**: Form, Field, Select, Checkbox, Radio
- **Data Display**: Table, List, Badge, Avatar
- **Feedback**: Alert, Toast, Progress, Spinner

### Using Components

1. **Browse**: Scroll through the component library
2. **Search**: Use the search bar to find specific components
3. **Preview**: Hover over components to see a preview
4. **Drag**: Drag components to the canvas to add them
5. **Categories**: Filter by component categories

## ⚙️ Properties Panel

The properties panel allows you to customize selected elements:

### Props Tab
- **Component Type**: Change the component type
- **Variant**: Select different style variants
- **Size**: Choose small, medium, or large sizes
- **Children**: Edit text content
- **Disabled State**: Toggle disabled state
- **Custom Props**: Add custom properties

### Styles Tab
- **Tailwind Classes**: Add custom Tailwind CSS classes
- **Class Validation**: Real-time validation of Tailwind classes
- **Responsive Classes**: Add responsive prefixes (sm:, md:, lg:)
- **Live Preview**: See changes in real-time

### Layout Tab
- **Display**: Set display type (block, flex, grid, etc.)
- **Flexbox**: Configure flex direction, justify, align
- **Grid**: Set up grid columns and rows
- **Spacing**: Add padding and margin
- **Positioning**: Set position and z-index

### Responsive Tab
- **Breakpoints**: Configure different styles for mobile, tablet, desktop
- **Viewport Preview**: See how your design looks on different screen sizes
- **Responsive Classes**: Add breakpoint-specific Tailwind classes

## 👁️ Live Preview

### Dev Server Integration

- **Auto-start**: Dev server starts automatically when you open a project
- **Live Reload**: Changes are reflected immediately in the preview
- **Error Handling**: See build errors and warnings in the preview
- **Console**: Access browser console for debugging

### Preview Controls

- **Refresh**: Manually refresh the preview
- **Stop/Start**: Control the dev server
- **Viewport**: Switch between different screen sizes
- **Fullscreen**: View preview in fullscreen mode

## ⌨️ Keyboard Shortcuts

### General
- `Ctrl/Cmd + N`: Create new project
- `Ctrl/Cmd + O`: Import existing project
- `Ctrl/Cmd + S`: Save project
- `Ctrl/Cmd + Z`: Undo
- `Ctrl/Cmd + Y`: Redo

### Canvas
- `Delete`: Delete selected element
- `Ctrl/Cmd + D`: Duplicate selected element
- `Ctrl/Cmd + A`: Select all elements
- `Escape`: Deselect all elements
- `Ctrl/Cmd + G`: Group selected elements

### View
- `Ctrl/Cmd + +`: Zoom in
- `Ctrl/Cmd + -`: Zoom out
- `Ctrl/Cmd + 0`: Reset zoom
- `F11`: Toggle fullscreen

## 🔧 Troubleshooting

### Common Issues

**App won't start:**
- Make sure all dependencies are installed: `npm install`
- Try rebuilding: `npm run build`
- Check for port conflicts (3000, 3001, etc.)

**Styling not applied:**
- Ensure Tailwind CSS is properly configured
- Check if PostCSS is working: `npx tailwindcss -i src/renderer/index.css -o test.css`
- Rebuild the renderer: `npm run build:renderer`

**Dev server won't start:**
- Check if the project has a valid `package.json`
- Ensure Next.js is installed in the project
- Try running `npm run dev` manually in the project directory

**Import detection fails:**
- Make sure the directory contains a valid Next.js project
- Check if `package.json` has Next.js as a dependency
- Verify the project structure is correct

### Debug Mode

Enable debug mode by setting `DEBUG=true` in your environment:

```bash
DEBUG=true npm run electron
```

This will show additional console logs and error details.

## 🚀 Advanced Features

### Code Sync

Nest Studio automatically syncs changes between the visual editor and your source code:

- **Bidirectional Sync**: Changes in code reflect in the visual editor
- **File Watching**: Monitors file changes and updates the UI
- **Conflict Resolution**: Handles conflicts between visual and code changes

### Project Structure

When you create a project, Nest Studio generates:

```
your-project/
├── src/
│   ├── app/ (or pages/)
│   ├── components/
│   ├── lib/
│   ├── types/
│   └── styles/
├── public/
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── components.json (if shadcn/ui enabled)
```

### Custom Components

You can add custom components to the library:

1. Create your component in the project
2. Add it to the component registry
3. It will appear in the component library
4. Use it in your visual editor

### Export Options

Export your projects in various formats:

- **Source Code**: Full Next.js project files
- **Static Export**: Static HTML/CSS/JS files
- **Component Library**: Reusable component package
- **Design Tokens**: Design system configuration

## 📞 Support

If you encounter any issues or have questions:

1. Check this usage guide
2. Look at the troubleshooting section
3. Check the console for error messages
4. Create an issue in the repository

## 🎯 Best Practices

### Project Organization
- Use descriptive component names
- Organize components in logical folders
- Keep styles consistent with your design system
- Use TypeScript for better type safety

### Performance
- Optimize images and assets
- Use Next.js Image component for images
- Implement proper loading states
- Test on different screen sizes

### Code Quality
- Use ESLint and Prettier for consistent code
- Write meaningful commit messages
- Test your components thoroughly
- Document complex components

---

**Happy Building! 🎉**

Nest Studio makes it easy to create beautiful, responsive Next.js applications with the power of visual editing and the flexibility of code.
