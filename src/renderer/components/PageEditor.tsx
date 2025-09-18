import { useState, useEffect } from 'react'
import { ProjectFile } from './ProjectExplorer'

interface PageElement {
    id: string
    type: string
    name: string
    props: Record<string, any>
    children: PageElement[]
    position: {
        x: number
        y: number
        width: number
        height: number
    }
    className?: string
    content?: string
}

interface PageEditorProps {
    file: ProjectFile
    onElementSelect: (element: PageElement) => void
    selectedElement?: PageElement | null
    onElementUpdate: (elementId: string, updates: Partial<PageElement>) => void
}

export function PageEditor({ file, onElementSelect, selectedElement }: PageEditorProps) {
    const [elements, setElements] = useState<PageElement[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (file) {
            loadPageContent()
        }
    }, [file])

    const loadPageContent = async () => {
        setLoading(true)
        setError(null)

        try {
            const result = await window.electronAPI.fs.readFile(file.path)
            if (result.success && result.data) {
                await parsePageContent()
            } else {
                setError('Failed to load page content')
            }
        } catch (error) {
            setError('Error loading page content')
            console.error('Failed to load page content:', error)
        } finally {
            setLoading(false)
        }
    }

    const parsePageContent = async () => {
        try {
            console.log('PageEditor: Parsing page content for:', file.path)
            // Parse the JSX/TSX content to extract elements
            const result = await window.electronAPI.codegen.parseFile(file.path)
            console.log('PageEditor: Parse result:', result)
            if (result.success && result.ast) {
                console.log('PageEditor: AST received:', result.ast)
                const parsedElements = extractElementsFromAST(result.ast)
                console.log('PageEditor: Parsed elements:', parsedElements)
                setElements(parsedElements)
            } else {
                console.log('PageEditor: Parse failed or no AST:', result)
            }
        } catch (error) {
            console.error('Failed to parse page content:', error)
        }
    }

    const extractElementsFromAST = (ast: any): PageElement[] => {
        console.log('PageEditor: extractElementsFromAST called with AST:', ast)
        const elements: PageElement[] = []
        let elementId = 0

        const traverse = (node: any, parentElement?: PageElement): void => {
            if (!node) return

            if (node.type === 'JSXElement') {
                console.log('PageEditor: Found JSXElement:', node)
                const element: PageElement = {
                    id: `element-${elementId++}`,
                    type: node.openingElement.name.name || 'div',
                    name: node.openingElement.name.name || 'div',
                    props: extractProps(node.openingElement.attributes),
                    children: [],
                    position: {
                        x: 0, // Will be positioned by CSS layout
                        y: 0,
                        width: 'auto',
                        height: 'auto'
                    }
                }

                // Extract className
                const classNameAttr = node.openingElement.attributes.find(
                    (attr: any) => attr.name && attr.name.name === 'className'
                )
                if (classNameAttr && classNameAttr.value) {
                    element.className = classNameAttr.value.value || classNameAttr.value.expression?.value
                }

                // Extract text content and process children
                if (node.children && node.children.length > 0) {
                    const textContent: string[] = []
                    const childElements: PageElement[] = []

                    node.children.forEach((child: any) => {
                        if (child.type === 'JSXText') {
                            const text = child.value.trim()
                            if (text) {
                                textContent.push(text)
                            }
                        } else if (child.type === 'JSXElement') {
                            traverse(child, element)
                        }
                    })

                    if (textContent.length > 0) {
                        element.content = textContent.join(' ')
                    }
                }

                // Add to parent's children or to root elements
                if (parentElement) {
                    parentElement.children.push(element)
                } else {
                    elements.push(element)
                }
            }
        }

        // Access the program body correctly
        const body = ast.program ? ast.program.body : ast.body

        if (body) {
            body.forEach((node: any) => {
                if (node.type === 'ExportDefaultDeclaration' && node.declaration.type === 'ArrowFunctionExpression') {
                    // Handle default export arrow function
                    if (node.declaration.body && node.declaration.body.type === 'JSXElement') {
                        traverse(node.declaration.body)
                    }
                } else if (node.type === 'ExportDefaultDeclaration' && node.declaration.type === 'FunctionDeclaration') {
                    // Handle default export function declaration
                    if (node.declaration.body && node.declaration.body.body) {
                        node.declaration.body.body.forEach((stmt: any) => {
                            if (stmt.type === 'ReturnStatement' && stmt.argument && stmt.argument.type === 'JSXElement') {
                                traverse(stmt.argument)
                            }
                        })
                    }
                }
            })
        }

        return elements
    }

    const extractProps = (attributes: any[]): Record<string, any> => {
        const props: Record<string, any> = {}

        attributes.forEach(attr => {
            if (attr.name && attr.name.name) {
                const key = attr.name.name
                let value: any = true

                if (attr.value) {
                    if (attr.value.type === 'Literal') {
                        value = attr.value.value
                    } else if (attr.value.type === 'JSXExpressionContainer') {
                        if (attr.value.expression.type === 'Literal') {
                            value = attr.value.expression.value
                        } else if (attr.value.expression.type === 'BooleanLiteral') {
                            value = attr.value.expression.value
                        }
                    }
                }

                props[key] = value
            }
        })

        return props
    }

    const handleElementClick = (element: PageElement) => {
        onElementSelect(element)
    }

    const renderElement = (element: PageElement) => {
        const { type, content, props, className } = element

        // Create props object for the component
        const componentProps = {
            ...props,
            className: className,
            style: {
                ...props.style
            }
        }

        // Render different element types
        switch (type) {
            case 'div':
                return <div {...componentProps}>{content || props.children}</div>
            case 'h1':
                return <h1 {...componentProps}>{content || props.children}</h1>
            case 'h2':
                return <h2 {...componentProps}>{content || props.children}</h2>
            case 'h3':
                return <h3 {...componentProps}>{content || props.children}</h3>
            case 'p':
                return <p {...componentProps}>{content || props.children}</p>
            case 'span':
                return <span {...componentProps}>{content || props.children}</span>
            case 'button':
                return <button {...componentProps}>{content || props.children || 'Button'}</button>
            case 'img':
                return <img {...componentProps} alt={props.alt || ''} src={props.src || ''} />
            case 'a':
                return <a {...componentProps} href={props.href || '#'}>{content || props.children}</a>
            case 'main':
                return <main {...componentProps}>{content || props.children}</main>
            case 'footer':
                return <footer {...componentProps}>{content || props.children}</footer>
            case 'header':
                return <header {...componentProps}>{content || props.children}</header>
            case 'section':
                return <section {...componentProps}>{content || props.children}</section>
            case 'article':
                return <article {...componentProps}>{content || props.children}</article>
            case 'nav':
                return <nav {...componentProps}>{content || props.children}</nav>
            case 'ul':
                return <ul {...componentProps}>{content || props.children}</ul>
            case 'ol':
                return <ol {...componentProps}>{content || props.children}</ol>
            case 'li':
                return <li {...componentProps}>{content || props.children}</li>
            case 'code':
                return <code {...componentProps}>{content || props.children}</code>
            default:
                return <div {...componentProps}>{content || props.children || `${type} element`}</div>
        }
    }

    const renderElementWithChildren = (element: PageElement) => {
        const { type, content, props, className, children } = element

        // Create props object for the component
        const componentProps = {
            ...props,
            className: className,
            style: {
                ...props.style
            }
        }

        // Render children recursively
        const renderedChildren = children && children.length > 0
            ? children.map(child => (
                <div key={child.id} className="relative">
                    {renderElementWithChildren(child)}
                </div>
            ))
            : null

        // Render different element types with children
        switch (type) {
            case 'div':
                return <div {...componentProps}>{renderedChildren || content}</div>
            case 'h1':
                return <h1 {...componentProps}>{renderedChildren || content}</h1>
            case 'h2':
                return <h2 {...componentProps}>{renderedChildren || content}</h2>
            case 'h3':
                return <h3 {...componentProps}>{renderedChildren || content}</h3>
            case 'p':
                return <p {...componentProps}>{renderedChildren || content}</p>
            case 'span':
                return <span {...componentProps}>{renderedChildren || content}</span>
            case 'button':
                return <button {...componentProps}>{renderedChildren || content || 'Button'}</button>
            case 'img':
                return <img {...componentProps} alt={props.alt || ''} src={props.src || ''} />
            case 'a':
                return <a {...componentProps} href={props.href || '#'}>{renderedChildren || content}</a>
            case 'main':
                return <main {...componentProps}>{renderedChildren || content}</main>
            case 'footer':
                return <footer {...componentProps}>{renderedChildren || content}</footer>
            case 'header':
                return <header {...componentProps}>{renderedChildren || content}</header>
            case 'section':
                return <section {...componentProps}>{renderedChildren || content}</section>
            case 'article':
                return <article {...componentProps}>{renderedChildren || content}</article>
            case 'nav':
                return <nav {...componentProps}>{renderedChildren || content}</nav>
            case 'ul':
                return <ul {...componentProps}>{renderedChildren || content}</ul>
            case 'ol':
                return <ol {...componentProps}>{renderedChildren || content}</ol>
            case 'li':
                return <li {...componentProps}>{renderedChildren || content}</li>
            case 'code':
                return <code {...componentProps}>{renderedChildren || content}</code>
            default:
                return <div {...componentProps}>{renderedChildren || content || `${type} element`}</div>
        }
    }

    // Element update handler is passed as prop

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="text-red-500 mb-2">⚠️</div>
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col">
            {/* Page Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {file.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {file.path}
                </p>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-gray-50 dark:bg-gray-900">
                    {/* Grid Background */}
                    <div className="absolute inset-0 opacity-20">
                        <svg width="100%" height="100%">
                            <defs>
                                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                    </div>

                    {/* Render the page as a proper layout */}
                    <div className="w-full h-full p-4">
                        {elements.map(element => (
                            <div
                                key={element.id}
                                className={`relative border-2 cursor-pointer transition-all ${selectedElement?.id === element.id
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                                    : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                                onClick={() => handleElementClick(element)}
                            >
                                {renderElementWithChildren(element)}

                                {/* Resize Handles */}
                                {selectedElement?.id === element.id && (
                                    <>
                                        <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize"></div>
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize"></div>
                                        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize"></div>
                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize"></div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {elements.length === 0 && (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center text-gray-500 dark:text-gray-400">
                                <div className="text-4xl mb-4">📄</div>
                                <p>No elements found in this page</p>
                                <p className="text-sm mt-2">Add components from the library to get started</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
