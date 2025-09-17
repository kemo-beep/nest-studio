# Project View Requirements

## Overview
When opening or creating a project, the application should display:
1. **Pages Explorer** - Shows Next.js App Router pages (page.tsx files)
2. **Components Explorer** - Shows custom components from the components folder
3. **Canvas** - Visual editor where users can edit pages and components
4. **Properties Panel** - Edit selected element properties

## Detailed Requirements

### 1. Project Explorer (Left Sidebar)
- **Pages Section**: Display all Next.js App Router pages (page.tsx files)
  - Show pages from `app/` directory structure
  - Display page hierarchy (nested routes)
  - Show page icons and names
  - Click to open page in canvas
- **Components Section**: Display custom components
  - Show components from `components/` folder
  - Display component hierarchy
  - Show component icons and names
  - Click to open component in canvas
- **Empty State**: If no components exist, show empty state with option to create new component

### 2. Canvas (Center Area)
- **Default Page**: When project opens, automatically load and display the root `page.tsx` file
- **Element Selection**: Click on any element in the page to select it
- **Element Properties**: Selected elements show their properties in the properties panel
- **Visual Editing**: Elements should be visually editable with proper styling
- **Real-time Updates**: Changes should reflect immediately in the canvas

### 3. Component Library (Right Sidebar)
- **Shadcn/ui Components**: Complete catalog of shadcn/ui components
  - Accordion, Alert, Alert Dialog, Aspect Ratio, Avatar, Badge, Breadcrumb, Button, Calendar, Card, Carousel, Chart, Checkbox, Collapsible, Combobox, Command, Context Menu, Data Table, Date Picker, Dialog, Drawer, Dropdown Menu, React Hook Form, Hover Card, Input, Input OTP, Label, Menubar, Navigation Menu, Pagination, Popover, Progress, Radio Group, Resizable, Scroll-area, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Sonner, Switch, Table, Tabs, Textarea, Toast, Toggle, Toggle Group, Tooltip, Typography
- **Layout Components**: Additional layout components
  - Row, Column, Stack, Grid, Container, Spacer
- **Drag & Drop**: Drag components from library to canvas
- **Component Creation**: Create new components by clicking "Create Component" button

### 4. Properties Panel (Right Sidebar)
- **Dynamic Props Editor**: Show props based on selected element
- **Tailwind Classes Editor**: Edit Tailwind CSS classes with autocomplete
- **Layout Properties**: Edit flexbox, grid, positioning properties
- **Real-time Preview**: Changes reflect immediately in canvas

### 5. Component Management
- **Create Component**: 
  - Click "Create Component" button
  - Enter component name
  - Choose component type (shadcn/ui component or custom)
  - Component is added to components folder and library
- **Edit Component**: Click on component in explorer to edit
- **Delete Component**: Right-click context menu to delete

### 6. Page Management
- **Open Page**: Click on page in explorer to open in canvas
- **Page Structure**: Show page hierarchy and routing structure
- **Page Editing**: Edit page content visually in canvas

### 7. Layout Components
- **Row**: Horizontal layout container with gap, align, justify props
- **Column**: Vertical layout container with gap, align props  
- **Stack**: Flexible stack container with direction, gap, align props
- **Grid**: Grid layout container with cols, gap props
- **Container**: Responsive container with maxWidth, padding props
- **Spacer**: Flexible spacer element with size, direction props

### 8. User Experience
- **Auto-load**: Root page.tsx loads automatically when project opens
- **Element Selection**: Click elements to select and edit properties
- **Visual Feedback**: Selected elements should be highlighted
- **Responsive Design**: Canvas should show responsive previews
- **Undo/Redo**: Support for undo/redo operations
- **Save**: Auto-save changes to files

### 9. File System Integration
- **Real-time Sync**: Changes in canvas sync to files
- **File Watching**: External file changes update the UI
- **AST Parsing**: Parse and modify JSX/TSX files properly
- **Code Generation**: Generate proper React/Next.js code

### 10. Technical Requirements
- **TypeScript Support**: Full TypeScript support for all components
- **Next.js App Router**: Support for Next.js 13+ App Router
- **Tailwind CSS**: Full Tailwind CSS integration
- **shadcn/ui**: Complete shadcn/ui component library
- **Performance**: Smooth 60fps interactions
- **Accessibility**: WCAG AA compliance
