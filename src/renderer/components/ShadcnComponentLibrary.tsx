import React, { useState } from 'react'

interface ShadcnComponent {
    id: string
    name: string
    category: string
    description: string
    icon: string
    props: Record<string, any>
    importPath: string
    dependencies?: string[]
}

interface ShadcnComponentLibraryProps {
    onComponentSelect: (component: ShadcnComponent) => void
}

export function ShadcnComponentLibrary({ onComponentSelect }: ShadcnComponentLibraryProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')

    const categories = [
        { id: 'all', name: 'All Components', icon: '🧩' },
        { id: 'layout', name: 'Layout', icon: '🏗️' },
        { id: 'form', name: 'Form', icon: '📝' },
        { id: 'ui', name: 'UI', icon: '🎨' },
        { id: 'navigation', name: 'Navigation', icon: '🧭' },
        { id: 'data', name: 'Data Display', icon: '📊' },
        { id: 'feedback', name: 'Feedback', icon: '💬' },
        { id: 'overlay', name: 'Overlay', icon: '🪟' }
    ]

    const shadcnComponents: ShadcnComponent[] = [
        // Layout Components
        {
            id: 'accordion',
            name: 'Accordion',
            category: 'ui',
            description: 'A vertically stacked set of interactive headings that each reveal a section of content.',
            icon: '📋',
            props: {
                type: 'single',
                collapsible: true,
                children: 'Accordion content'
            },
            importPath: '@/components/ui/accordion',
            dependencies: ['@radix-ui/react-accordion']
        },
        {
            id: 'alert',
            name: 'Alert',
            category: 'feedback',
            description: 'Displays a callout for user attention.',
            icon: '⚠️',
            props: {
                variant: 'default',
                children: 'Alert message'
            },
            importPath: '@/components/ui/alert',
            dependencies: ['@radix-ui/react-alert']
        },
        {
            id: 'alert-dialog',
            name: 'Alert Dialog',
            category: 'overlay',
            description: 'A modal dialog that interrupts the user with important content and expects a response.',
            icon: '🚨',
            props: {
                open: false,
                children: 'Alert dialog content'
            },
            importPath: '@/components/ui/alert-dialog',
            dependencies: ['@radix-ui/react-alert-dialog']
        },
        {
            id: 'aspect-ratio',
            name: 'Aspect Ratio',
            category: 'layout',
            description: 'Displays content within a desired ratio.',
            icon: '📐',
            props: {
                ratio: 16 / 9,
                children: 'Content'
            },
            importPath: '@/components/ui/aspect-ratio',
            dependencies: ['@radix-ui/react-aspect-ratio']
        },
        {
            id: 'avatar',
            name: 'Avatar',
            category: 'ui',
            description: 'An image element with a fallback for representing the user.',
            icon: '👤',
            props: {
                fallback: 'JD',
                alt: 'User avatar'
            },
            importPath: '@/components/ui/avatar',
            dependencies: ['@radix-ui/react-avatar']
        },
        {
            id: 'badge',
            name: 'Badge',
            category: 'ui',
            description: 'Displays a badge or a component that looks like a badge.',
            icon: '🏷️',
            props: {
                variant: 'default',
                children: 'Badge'
            },
            importPath: '@/components/ui/badge'
        },
        {
            id: 'breadcrumb',
            name: 'Breadcrumb',
            category: 'navigation',
            description: 'Displays the path to the current resource using a hierarchy of links.',
            icon: '🍞',
            props: {
                items: ['Home', 'Products', 'Category']
            },
            importPath: '@/components/ui/breadcrumb',
            dependencies: ['@radix-ui/react-breadcrumb']
        },
        {
            id: 'button',
            name: 'Button',
            category: 'form',
            description: 'Displays a button or a component that looks like a button.',
            icon: '🔘',
            props: {
                variant: 'default',
                size: 'default',
                disabled: false,
                children: 'Button'
            },
            importPath: '@/components/ui/button'
        },
        {
            id: 'calendar',
            name: 'Calendar',
            category: 'form',
            description: 'A date field component that allows users to enter and edit date.',
            icon: '📅',
            props: {
                mode: 'single',
                selected: new Date(),
                onSelect: () => { }
            },
            importPath: '@/components/ui/calendar',
            dependencies: ['@radix-ui/react-calendar', 'react-day-picker']
        },
        {
            id: 'card',
            name: 'Card',
            category: 'ui',
            description: 'Displays a card with header, content, and footer.',
            icon: '🃏',
            props: {
                title: 'Card Title',
                description: 'Card description',
                children: 'Card content'
            },
            importPath: '@/components/ui/card'
        },
        {
            id: 'carousel',
            name: 'Carousel',
            category: 'ui',
            description: 'A carousel with motion and swipe built using Embla.',
            icon: '🎠',
            props: {
                orientation: 'horizontal',
                children: 'Carousel content'
            },
            importPath: '@/components/ui/carousel',
            dependencies: ['embla-carousel-react']
        },
        {
            id: 'chart',
            name: 'Chart',
            category: 'data',
            description: 'A collection of re-usable chart components built on top of Recharts.',
            icon: '📊',
            props: {
                data: [],
                children: 'Chart content'
            },
            importPath: '@/components/ui/chart',
            dependencies: ['recharts']
        },
        {
            id: 'checkbox',
            name: 'Checkbox',
            category: 'form',
            description: 'A control that allows the user to toggle between checked and not checked.',
            icon: '☑️',
            props: {
                checked: false,
                disabled: false,
                children: 'Checkbox label'
            },
            importPath: '@/components/ui/checkbox',
            dependencies: ['@radix-ui/react-checkbox']
        },
        {
            id: 'collapsible',
            name: 'Collapsible',
            category: 'ui',
            description: 'An interactive component which expands/collapses a panel.',
            icon: '📁',
            props: {
                open: false,
                children: 'Collapsible content'
            },
            importPath: '@/components/ui/collapsible',
            dependencies: ['@radix-ui/react-collapsible']
        },
        {
            id: 'combobox',
            name: 'Combobox',
            category: 'form',
            description: 'A combination of a select input and a search input.',
            icon: '🔍',
            props: {
                options: [],
                placeholder: 'Select option...',
                searchable: true
            },
            importPath: '@/components/ui/combobox',
            dependencies: ['@radix-ui/react-combobox']
        },
        {
            id: 'command',
            name: 'Command',
            category: 'form',
            description: 'Fast, composable, unstyled command menu for React.',
            icon: '⌘',
            props: {
                placeholder: 'Type a command or search...',
                children: 'Command content'
            },
            importPath: '@/components/ui/command',
            dependencies: ['cmdk']
        },
        {
            id: 'context-menu',
            name: 'Context Menu',
            category: 'overlay',
            description: 'Displays a menu to the user — such as a set of actions or functions — triggered by a right-click.',
            icon: '📋',
            props: {
                children: 'Context menu content'
            },
            importPath: '@/components/ui/context-menu',
            dependencies: ['@radix-ui/react-context-menu']
        },
        {
            id: 'data-table',
            name: 'Data Table',
            category: 'data',
            description: 'A powerful table component built on top of TanStack Table.',
            icon: '📋',
            props: {
                data: [],
                columns: [],
                pagination: true
            },
            importPath: '@/components/ui/data-table',
            dependencies: ['@tanstack/react-table']
        },
        {
            id: 'date-picker',
            name: 'Date Picker',
            category: 'form',
            description: 'A date picker component with range and presets.',
            icon: '📅',
            props: {
                mode: 'single',
                selected: new Date(),
                placeholder: 'Pick a date'
            },
            importPath: '@/components/ui/date-picker',
            dependencies: ['react-day-picker']
        },
        {
            id: 'dialog',
            name: 'Dialog',
            category: 'overlay',
            description: 'A window overlaid on either the primary window or another dialog window.',
            icon: '🪟',
            props: {
                open: false,
                children: 'Dialog content'
            },
            importPath: '@/components/ui/dialog',
            dependencies: ['@radix-ui/react-dialog']
        },
        {
            id: 'drawer',
            name: 'Drawer',
            category: 'overlay',
            description: 'A drawer component for mobile.',
            icon: '📱',
            props: {
                open: false,
                children: 'Drawer content'
            },
            importPath: '@/components/ui/drawer',
            dependencies: ['vaul']
        },
        {
            id: 'dropdown-menu',
            name: 'Dropdown Menu',
            category: 'overlay',
            description: 'Displays a menu to the user — such as a set of actions or functions — triggered by a button.',
            icon: '📋',
            props: {
                children: 'Dropdown menu content'
            },
            importPath: '@/components/ui/dropdown-menu',
            dependencies: ['@radix-ui/react-dropdown-menu']
        },
        {
            id: 'form',
            name: 'React Hook Form',
            category: 'form',
            description: 'Forms with React Hook Form and Zod validation.',
            icon: '📝',
            props: {
                schema: {},
                onSubmit: () => { },
                children: 'Form content'
            },
            importPath: '@/components/ui/form',
            dependencies: ['react-hook-form', 'zod', '@hookform/resolvers']
        },
        {
            id: 'hover-card',
            name: 'Hover Card',
            category: 'overlay',
            description: 'For sighted users to preview content available behind a link.',
            icon: '💭',
            props: {
                children: 'Hover card content'
            },
            importPath: '@/components/ui/hover-card',
            dependencies: ['@radix-ui/react-hover-card']
        },
        {
            id: 'input',
            name: 'Input',
            category: 'form',
            description: 'Displays a form input field or a component that looks like an input field.',
            icon: '📝',
            props: {
                type: 'text',
                placeholder: 'Enter text...',
                disabled: false,
                required: false
            },
            importPath: '@/components/ui/input'
        },
        {
            id: 'input-otp',
            name: 'Input OTP',
            category: 'form',
            description: 'A one-time password input component.',
            icon: '🔐',
            props: {
                maxLength: 6,
                value: '',
                onChange: () => { }
            },
            importPath: '@/components/ui/input-otp',
            dependencies: ['input-otp']
        },
        {
            id: 'label',
            name: 'Label',
            category: 'form',
            description: 'Renders an accessible label associated with controls.',
            icon: '🏷️',
            props: {
                children: 'Label text'
            },
            importPath: '@/components/ui/label',
            dependencies: ['@radix-ui/react-label']
        },
        {
            id: 'menubar',
            name: 'Menubar',
            category: 'navigation',
            description: 'A visually persistent menu common in desktop applications.',
            icon: '📋',
            props: {
                children: 'Menubar content'
            },
            importPath: '@/components/ui/menubar',
            dependencies: ['@radix-ui/react-menubar']
        },
        {
            id: 'navigation-menu',
            name: 'Navigation Menu',
            category: 'navigation',
            description: 'A collection of links for navigating websites.',
            icon: '🧭',
            props: {
                children: 'Navigation menu content'
            },
            importPath: '@/components/ui/navigation-menu',
            dependencies: ['@radix-ui/react-navigation-menu']
        },
        {
            id: 'pagination',
            name: 'Pagination',
            category: 'navigation',
            description: 'A set of presentational components for building pagination UI.',
            icon: '📄',
            props: {
                currentPage: 1,
                totalPages: 10,
                onPageChange: () => { }
            },
            importPath: '@/components/ui/pagination'
        },
        {
            id: 'popover',
            name: 'Popover',
            category: 'overlay',
            description: 'Displays rich content in a portal, triggered by a button.',
            icon: '💬',
            props: {
                open: false,
                children: 'Popover content'
            },
            importPath: '@/components/ui/popover',
            dependencies: ['@radix-ui/react-popover']
        },
        {
            id: 'progress',
            name: 'Progress',
            category: 'ui',
            description: 'Displays an indicator showing the completion progress of a task.',
            icon: '📊',
            props: {
                value: 0,
                max: 100
            },
            importPath: '@/components/ui/progress',
            dependencies: ['@radix-ui/react-progress']
        },
        {
            id: 'radio-group',
            name: 'Radio Group',
            category: 'form',
            description: 'A set of checkable buttons—known as radio buttons—where no more than one of the buttons can be checked at a time.',
            icon: '🔘',
            props: {
                value: '',
                options: [],
                onValueChange: () => { }
            },
            importPath: '@/components/ui/radio-group',
            dependencies: ['@radix-ui/react-radio-group']
        },
        {
            id: 'resizable',
            name: 'Resizable',
            category: 'ui',
            description: 'Accessible resizable panel groups and layouts with keyboard support.',
            icon: '📏',
            props: {
                direction: 'horizontal',
                children: 'Resizable content'
            },
            importPath: '@/components/ui/resizable',
            dependencies: ['react-resizable-panels']
        },
        {
            id: 'scroll-area',
            name: 'Scroll Area',
            category: 'ui',
            description: 'Augments native scroll functionality for custom, cross-browser styling.',
            icon: '📜',
            props: {
                children: 'Scroll area content'
            },
            importPath: '@/components/ui/scroll-area',
            dependencies: ['@radix-ui/react-scroll-area']
        },
        {
            id: 'select',
            name: 'Select',
            category: 'form',
            description: 'Displays a list of options for the user to pick from—triggered by a button.',
            icon: '📋',
            props: {
                value: '',
                options: [],
                placeholder: 'Select option...',
                onValueChange: () => { }
            },
            importPath: '@/components/ui/select',
            dependencies: ['@radix-ui/react-select']
        },
        {
            id: 'separator',
            name: 'Separator',
            category: 'ui',
            description: 'Visually or semantically separates content.',
            icon: '➖',
            props: {
                orientation: 'horizontal'
            },
            importPath: '@/components/ui/separator',
            dependencies: ['@radix-ui/react-separator']
        },
        {
            id: 'sheet',
            name: 'Sheet',
            category: 'overlay',
            description: 'Extends the Dialog component to display content that complements the main content of the screen.',
            icon: '📄',
            props: {
                open: false,
                children: 'Sheet content'
            },
            importPath: '@/components/ui/sheet',
            dependencies: ['@radix-ui/react-dialog']
        },
        {
            id: 'sidebar',
            name: 'Sidebar',
            category: 'layout',
            description: 'A sidebar component with navigation and content areas.',
            icon: '📱',
            props: {
                children: 'Sidebar content'
            },
            importPath: '@/components/ui/sidebar',
            dependencies: ['@radix-ui/react-sidebar']
        },
        {
            id: 'skeleton',
            name: 'Skeleton',
            category: 'ui',
            description: 'Use to show a placeholder while content is loading.',
            icon: '💀',
            props: {
                className: 'h-4 w-full'
            },
            importPath: '@/components/ui/skeleton'
        },
        {
            id: 'slider',
            name: 'Slider',
            category: 'form',
            description: 'An input where the user selects a value from within a given range.',
            icon: '🎚️',
            props: {
                value: [0],
                min: 0,
                max: 100,
                step: 1,
                onValueChange: () => { }
            },
            importPath: '@/components/ui/slider',
            dependencies: ['@radix-ui/react-slider']
        },
        {
            id: 'sonner',
            name: 'Sonner',
            category: 'feedback',
            description: 'An opinionated toast component for React.',
            icon: '🍞',
            props: {
                position: 'bottom-right',
                children: 'Toast content'
            },
            importPath: '@/components/ui/sonner',
            dependencies: ['sonner']
        },
        {
            id: 'switch',
            name: 'Switch',
            category: 'form',
            description: 'A control that allows the user to toggle between checked and not checked.',
            icon: '🔘',
            props: {
                checked: false,
                disabled: false,
                onCheckedChange: () => { }
            },
            importPath: '@/components/ui/switch',
            dependencies: ['@radix-ui/react-switch']
        },
        {
            id: 'table',
            name: 'Table',
            category: 'data',
            description: 'A responsive table component.',
            icon: '📊',
            props: {
                data: [],
                columns: []
            },
            importPath: '@/components/ui/table'
        },
        {
            id: 'tabs',
            name: 'Tabs',
            category: 'ui',
            description: 'A set of layered sections of content—known as tab panels—that are displayed one at a time.',
            icon: '📑',
            props: {
                defaultValue: 'tab1',
                children: 'Tabs content'
            },
            importPath: '@/components/ui/tabs',
            dependencies: ['@radix-ui/react-tabs']
        },
        {
            id: 'textarea',
            name: 'Textarea',
            category: 'form',
            description: 'Displays a form textarea or a component that looks like a textarea.',
            icon: '📝',
            props: {
                placeholder: 'Enter text...',
                disabled: false,
                required: false,
                rows: 3
            },
            importPath: '@/components/ui/textarea'
        },
        {
            id: 'toast',
            name: 'Toast',
            category: 'feedback',
            description: 'A succinct message that is displayed temporarily.',
            icon: '🍞',
            props: {
                title: 'Toast title',
                description: 'Toast description',
                variant: 'default'
            },
            importPath: '@/components/ui/toast',
            dependencies: ['@radix-ui/react-toast']
        },
        {
            id: 'toggle',
            name: 'Toggle',
            category: 'form',
            description: 'A two-state button that can be either on or off.',
            icon: '🔘',
            props: {
                pressed: false,
                onPressedChange: () => { }
            },
            importPath: '@/components/ui/toggle',
            dependencies: ['@radix-ui/react-toggle']
        },
        {
            id: 'toggle-group',
            name: 'Toggle Group',
            category: 'form',
            description: 'A set of two-state buttons that can be toggled on or off.',
            icon: '🔘',
            props: {
                type: 'single',
                value: '',
                onValueChange: () => { }
            },
            importPath: '@/components/ui/toggle-group',
            dependencies: ['@radix-ui/react-toggle-group']
        },
        {
            id: 'tooltip',
            name: 'Tooltip',
            category: 'overlay',
            description: 'A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.',
            icon: '💡',
            props: {
                children: 'Tooltip content'
            },
            importPath: '@/components/ui/tooltip',
            dependencies: ['@radix-ui/react-tooltip']
        },
        {
            id: 'typography',
            name: 'Typography',
            category: 'ui',
            description: 'A collection of typography components.',
            icon: '📝',
            props: {
                variant: 'h1',
                children: 'Typography text'
            },
            importPath: '@/components/ui/typography'
        }
    ]

    // Layout Components
    const layoutComponents: ShadcnComponent[] = [
        {
            id: 'row',
            name: 'Row',
            category: 'layout',
            description: 'A horizontal layout container',
            icon: '➡️',
            props: {
                gap: 4,
                align: 'start',
                justify: 'start',
                children: 'Row content'
            },
            importPath: '@/components/layout/row'
        },
        {
            id: 'column',
            name: 'Column',
            category: 'layout',
            description: 'A vertical layout container',
            icon: '⬇️',
            props: {
                gap: 4,
                align: 'start',
                children: 'Column content'
            },
            importPath: '@/components/layout/column'
        },
        {
            id: 'stack',
            name: 'Stack',
            category: 'layout',
            description: 'A flexible stack container',
            icon: '📚',
            props: {
                direction: 'vertical',
                gap: 4,
                align: 'start',
                children: 'Stack content'
            },
            importPath: '@/components/layout/stack'
        },
        {
            id: 'grid',
            name: 'Grid',
            category: 'layout',
            description: 'A grid layout container',
            icon: '⊞',
            props: {
                cols: 3,
                gap: 4,
                children: 'Grid content'
            },
            importPath: '@/components/layout/grid'
        },
        {
            id: 'container',
            name: 'Container',
            category: 'layout',
            description: 'A responsive container',
            icon: '📦',
            props: {
                maxWidth: 'xl',
                padding: 4,
                children: 'Container content'
            },
            importPath: '@/components/layout/container'
        },
        {
            id: 'spacer',
            name: 'Spacer',
            category: 'layout',
            description: 'A flexible spacer element',
            icon: '↔️',
            props: {
                size: 'md',
                direction: 'horizontal'
            },
            importPath: '@/components/layout/spacer'
        }
    ]

    const allComponents = [...shadcnComponents, ...layoutComponents]

    const filteredComponents = allComponents.filter(component => {
        const matchesSearch = component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            component.description.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const handleDragStart = (e: React.DragEvent, component: ShadcnComponent) => {
        e.dataTransfer.setData('application/json', JSON.stringify({
            type: 'component',
            id: component.id,
            name: component.name,
            props: component.props,
            importPath: component.importPath,
            dependencies: component.dependencies
        }))
        e.dataTransfer.effectAllowed = 'copy'
    }

    return (
        <div className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Component Library
                </h3>

                {/* Search */}
                <div className="mb-3">
                    <input
                        type="text"
                        placeholder="Search components..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-1">
                    {categories.map(category => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`px-2 py-1 text-xs rounded-md transition-colors ${selectedCategory === category.id
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            {category.icon} {category.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Components List */}
            <div className="overflow-y-auto h-full">
                {filteredComponents.map(component => (
                    <div
                        key={component.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, component)}
                        className="p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-move transition-colors"
                        onClick={() => onComponentSelect(component)}
                    >
                        <div className="flex items-start space-x-3">
                            <span className="text-lg">{component.icon}</span>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                    {component.name}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {component.description}
                                </p>
                                <div className="flex items-center space-x-2 mt-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                        {component.category}
                                    </span>
                                    {component.dependencies && component.dependencies.length > 0 && (
                                        <span className="text-xs text-blue-600 dark:text-blue-400">
                                            {component.dependencies.length} deps
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredComponents.length === 0 && (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        <div className="text-2xl mb-2">🔍</div>
                        <p className="text-sm">No components found</p>
                        <p className="text-xs mt-1">Try adjusting your search or category</p>
                    </div>
                )}
            </div>
        </div>
    )
}
