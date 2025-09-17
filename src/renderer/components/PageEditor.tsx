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

export function PageEditor({ file, onElementSelect, selectedElement, onElementUpdate }: PageEditorProps) {
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
            // Parse the JSX/TSX content to extract elements
            const result = await window.electronAPI.codegen.parseFile(file.path)
            if (result.success && result.ast) {
                const parsedElements = extractElementsFromAST(result.ast)
                setElements(parsedElements)
            }
        } catch (error) {
            console.error('Failed to parse page content:', error)
        }
    }

    const extractElementsFromAST = (ast: any): PageElement[] => {
        const elements: PageElement[] = []
        let elementId = 0

        const traverse = (node: any): void => {
            if (!node) return

            if (node.type === 'JSXElement') {
                const element: PageElement = {
                    id: `element-${elementId++}`,
                    type: node.openingElement.name.name || 'div',
                    name: node.openingElement.name.name || 'div',
                    props: extractProps(node.openingElement.attributes),
                    children: [],
                    position: {
                        x: Math.random() * 400 + 50, // Random position for now
                        y: Math.random() * 300 + 50,
                        width: 200,
                        height: 50
                    }
                }

                // Extract text content
                if (node.children && node.children.length === 1 && node.children[0].type === 'JSXText') {
                    element.content = node.children[0].value.trim()
                }

                // Extract className
                const classNameAttr = node.openingElement.attributes.find(
                    (attr: any) => attr.name && attr.name.name === 'className'
                )
                if (classNameAttr && classNameAttr.value) {
                    element.className = classNameAttr.value.value || classNameAttr.value.expression?.value
                }

                // Process children
                if (node.children) {
                    node.children.forEach((child: any) => {
                        if (child.type === 'JSXElement') {
                            traverse(child)
                        }
                    })
                }

                elements.push(element)
            }
        }

        if (ast.body) {
            ast.body.forEach((node: any) => {
                if (node.type === 'ExportDefaultDeclaration' && node.declaration.type === 'ArrowFunctionExpression') {
                    // Handle default export function
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

                    {/* Elements */}
                    {elements.map(element => (
                        <div
                            key={element.id}
                            className={`absolute border-2 cursor-pointer transition-all ${selectedElement?.id === element.id
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                                : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                                }`}
                            style={{
                                left: element.position.x,
                                top: element.position.y,
                                width: element.position.width,
                                height: element.position.height,
                                minHeight: '40px',
                                minWidth: '100px'
                            }}
                            onClick={() => handleElementClick(element)}
                        >
                            {/* Element Content */}
                            <div className="h-full w-full p-2 bg-white dark:bg-gray-800 rounded shadow-sm">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                    {element.type}
                                </div>
                                <div className="text-sm">
                                    {element.content || element.props.children || `${element.type} element`}
                                </div>
                                {element.className && (
                                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                        {element.className}
                                    </div>
                                )}
                            </div>

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
