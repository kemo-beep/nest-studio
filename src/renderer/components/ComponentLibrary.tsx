import { useState } from 'react'

interface ComponentLibraryProps {
    project: any
}

interface ComponentItem {
    id: string
    name: string
    category: string
    description: string
    icon: string
    props: Record<string, any>
}

const components: ComponentItem[] = [
    // Layout Components
    {
        id: 'div',
        name: 'Div',
        category: 'Layout',
        description: 'Basic container element',
        icon: '📦',
        props: { className: '', children: 'Div' }
    },
    {
        id: 'section',
        name: 'Section',
        category: 'Layout',
        description: 'Semantic section element',
        icon: '📄',
        props: { className: '', children: 'Section' }
    },
    {
        id: 'header',
        name: 'Header',
        category: 'Layout',
        description: 'Page or section header',
        icon: '📋',
        props: { className: '', children: 'Header' }
    },
    {
        id: 'footer',
        name: 'Footer',
        category: 'Layout',
        description: 'Page or section footer',
        icon: '🦶',
        props: { className: '', children: 'Footer' }
    },
    {
        id: 'main',
        name: 'Main',
        category: 'Layout',
        description: 'Main content area',
        icon: '📝',
        props: { className: '', children: 'Main Content' }
    },

    // Form Components
    {
        id: 'button',
        name: 'Button',
        category: 'Form',
        description: 'Interactive button element',
        icon: '🔘',
        props: {
            variant: 'default',
            size: 'default',
            disabled: false,
            children: 'Button'
        }
    },
    {
        id: 'input',
        name: 'Input',
        category: 'Form',
        description: 'Text input field',
        icon: '📝',
        props: {
            type: 'text',
            placeholder: 'Enter text...',
            disabled: false,
            required: false
        }
    },
    {
        id: 'textarea',
        name: 'Textarea',
        category: 'Form',
        description: 'Multi-line text input',
        icon: '📄',
        props: { className: 'px-3 py-2 border rounded', rows: 3, placeholder: 'Enter text...' }
    },
    {
        id: 'select',
        name: 'Select',
        category: 'Form',
        description: 'Dropdown selection',
        icon: '📋',
        props: { className: 'px-3 py-2 border rounded' }
    },
    {
        id: 'label',
        name: 'Label',
        category: 'Form',
        description: 'Form field label',
        icon: '🏷️',
        props: { className: 'block text-sm font-medium', children: 'Label' }
    },

    // Typography
    {
        id: 'h1',
        name: 'Heading 1',
        category: 'Typography',
        description: 'Main page heading',
        icon: 'H1',
        props: { className: 'text-4xl font-bold', children: 'Heading 1' }
    },
    {
        id: 'h2',
        name: 'Heading 2',
        category: 'Typography',
        description: 'Section heading',
        icon: 'H2',
        props: { className: 'text-3xl font-bold', children: 'Heading 2' }
    },
    {
        id: 'h3',
        name: 'Heading 3',
        category: 'Typography',
        description: 'Subsection heading',
        icon: 'H3',
        props: { className: 'text-2xl font-bold', children: 'Heading 3' }
    },
    {
        id: 'p',
        name: 'Paragraph',
        category: 'Typography',
        description: 'Text paragraph',
        icon: 'P',
        props: { className: 'text-base', children: 'This is a paragraph of text.' }
    },
    {
        id: 'span',
        name: 'Span',
        category: 'Typography',
        description: 'Inline text element',
        icon: 'S',
        props: { className: 'text-sm', children: 'Span text' }
    },

    // Media
    {
        id: 'img',
        name: 'Image',
        category: 'Media',
        description: 'Image element',
        icon: '🖼️',
        props: { className: 'w-full h-auto', src: 'https://via.placeholder.com/300x200', alt: 'Image' }
    },
    {
        id: 'video',
        name: 'Video',
        category: 'Media',
        description: 'Video element',
        icon: '🎥',
        props: { className: 'w-full h-auto', controls: true }
    },

    // Navigation
    {
        id: 'nav',
        name: 'Navigation',
        category: 'Navigation',
        description: 'Navigation container',
        icon: '🧭',
        props: { className: 'flex space-x-4', children: 'Navigation' }
    },
    {
        id: 'ul',
        name: 'List',
        category: 'Navigation',
        description: 'Unordered list',
        icon: '📋',
        props: { className: 'list-disc list-inside', children: 'List Item' }
    },
    {
        id: 'ol',
        name: 'Ordered List',
        category: 'Navigation',
        description: 'Ordered list',
        icon: '🔢',
        props: { className: 'list-decimal list-inside', children: 'List Item' }
    },

    // UI Components (for real rendering)
    {
        id: 'card',
        name: 'Card',
        category: 'UI',
        description: 'Card container component',
        icon: '🃏',
        props: {
            title: 'Card Title',
            description: 'Card description',
            children: 'Card content'
        }
    },
    {
        id: 'badge',
        name: 'Badge',
        category: 'UI',
        description: 'Badge element',
        icon: '🏷️',
        props: {
            variant: 'default',
            children: 'Badge'
        }
    },
    {
        id: 'avatar',
        name: 'Avatar',
        category: 'UI',
        description: 'User avatar',
        icon: '👤',
        props: {
            fallback: 'JD',
            alt: 'User avatar'
        }
    },
    {
        id: 'container',
        name: 'Container',
        category: 'UI',
        description: 'Generic container',
        icon: '📦',
        props: {
            children: 'Container content'
        }
    }
]

export function ComponentLibrary({ project: _project }: ComponentLibraryProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('All')

    const categories = ['All', ...Array.from(new Set(components.map(c => c.category)))]

    const filteredComponents = components.filter(component => {
        const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            component.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === 'All' || component.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const handleDragStart = (e: React.DragEvent, component: ComponentItem) => {
        e.dataTransfer.setData('application/json', JSON.stringify({
            type: 'component',
            id: component.id,
            name: component.name,
            props: component.props
        }))
        e.dataTransfer.effectAllowed = 'copy'
    }

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Component Library
                </h3>

                {/* Search */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search components..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-1">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-2 py-1 text-xs rounded-full transition-colors ${selectedCategory === category
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Components List */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                    {filteredComponents.map(component => (
                        <div
                            key={component.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, component)}
                            className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-move hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="text-2xl">{component.icon}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2">
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {component.name}
                                        </h4>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {component.category}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {component.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredComponents.length === 0 && (
                    <div className="text-center py-8">
                        <div className="text-gray-400 dark:text-gray-500 text-sm">
                            No components found
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Drag components to canvas
                </div>
            </div>
        </div>
    )
}
