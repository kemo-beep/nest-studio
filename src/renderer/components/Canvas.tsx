import { useState, useRef, useEffect } from 'react'
import { ProjectInfo } from '@/shared/types'
import { RealComponentRenderer } from './RealComponentRenderer'

interface CanvasProps {
    project: ProjectInfo
}

interface CanvasElement {
    id: string
    type: string
    name: string
    x: number
    y: number
    width: number
    height: number
    props: Record<string, any>
    className?: string
    children?: string
}

export function Canvas({ project: _project }: CanvasProps) {
    const [elements, setElements] = useState<CanvasElement[]>([])
    const [selectedElement, setSelectedElement] = useState<string | null>(null)
    const [hoveredElement, setHoveredElement] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
    const canvasRef = useRef<HTMLDivElement>(null)

    // Expose selected element to parent
    const selectedElementData = selectedElement ? elements.find(el => el.id === selectedElement) : null

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'copy'
    }

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault()

        try {
            const data = JSON.parse(e.dataTransfer.getData('application/json'))

            if (data.type === 'component') {
                const rect = canvasRef.current?.getBoundingClientRect()
                if (!rect) return

                const x = e.clientX - rect.left
                const y = e.clientY - rect.top

                const newElement: CanvasElement = {
                    id: `element-${Date.now()}`,
                    type: data.id,
                    name: data.name,
                    x: x - 50, // Center the element
                    y: y - 25,
                    width: 100,
                    height: 50,
                    props: data.props || {},
                    className: data.props?.className || '',
                    children: data.props?.children || ''
                }

                // Add to local state
                setElements(prev => [...prev, newElement])

                // Sync to file system
                if (window.electronAPI?.sync?.addComponent) {
                    const componentNode = {
                        id: newElement.id,
                        type: newElement.type,
                        name: newElement.name,
                        props: newElement.props,
                        className: newElement.className,
                        children: newElement.children,
                        position: {
                            x: newElement.x,
                            y: newElement.y,
                            width: newElement.width,
                            height: newElement.height
                        }
                    }

                    const result = await window.electronAPI.sync.addComponent(componentNode)
                    if (!result.success) {
                        console.error('Failed to sync component to file:', result.error)
                    }
                }
            }
        } catch (error) {
            console.error('Failed to handle drop:', error)
        }
    }

    const handleElementMouseDown = (elementId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setSelectedElement(elementId)
        setIsDragging(true)

        const element = elements.find(el => el.id === elementId)
        if (element) {
            setDragOffset({
                x: e.clientX - element.x,
                y: e.clientY - element.y
            })
        }
    }

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging || !selectedElement) return

        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return

        const newX = e.clientX - rect.left - dragOffset.x
        const newY = e.clientY - rect.top - dragOffset.y

        setElements(prev => prev.map(el =>
            el.id === selectedElement
                ? { ...el, x: Math.max(0, newX), y: Math.max(0, newY) }
                : el
        ))
    }

    const handleMouseUp = () => {
        setIsDragging(false)
        setDragOffset({ x: 0, y: 0 })
    }

    const handleCanvasClick = () => {
        setSelectedElement(null)
    }

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isDragging, selectedElement, dragOffset])

    return (
        <div className="h-full relative bg-gray-50 dark:bg-gray-900">
            {/* Canvas Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            Canvas
                        </h3>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>{elements.length} elements</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* Viewport Controls */}
                        <div className="flex items-center space-x-1">
                            <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                            <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Canvas Area */}
            <div
                ref={canvasRef}
                className="h-full pt-12 canvas-container"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={handleCanvasClick}
            >
                {/* Grid Overlay */}
                <div className="canvas-grid"></div>

                {/* Canvas Elements */}
                {elements.map(element => (
                    <RealComponentRenderer
                        key={element.id}
                        component={{
                            id: element.id,
                            type: element.type,
                            props: element.props,
                            className: element.className,
                            children: element.children,
                            position: {
                                x: element.x,
                                y: element.y,
                                width: element.width,
                                height: element.height
                            }
                        }}
                        isSelected={selectedElement === element.id}
                        onSelect={() => setSelectedElement(element.id)}
                        onUpdate={(updates) => {
                            setElements(prev => prev.map(el =>
                                el.id === element.id
                                    ? { ...el, ...updates }
                                    : el
                            ))
                        }}
                    />
                ))}

                {/* Empty State */}
                {elements.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Start Building
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                Drag components from the sidebar to start building your interface
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

