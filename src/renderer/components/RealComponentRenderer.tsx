import { useState, useEffect, useRef } from 'react'

interface RealComponentRendererProps {
    component: {
        id: string
        type: string
        props: Record<string, any>
        className?: string
        children?: string
        position: {
            x: number
            y: number
            width: number
            height: number
        }
    }
    isSelected?: boolean
    onSelect?: () => void
    onUpdate?: (updates: any) => void
}

export function RealComponentRenderer({
    component,
    isSelected = false,
    onSelect,
    onUpdate
}: RealComponentRendererProps) {
    const [isHovered, setIsHovered] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
    const elementRef = useRef<HTMLDivElement>(null)

    // Handle mouse down for dragging
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (onSelect) {
            onSelect()
        }

        setIsDragging(true)
        setDragStart({ x: e.clientX, y: e.clientY })
        setDragOffset({ x: 0, y: 0 })
    }

    // Handle mouse move for dragging
    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return

        const deltaX = e.clientX - dragStart.x
        const deltaY = e.clientY - dragStart.y

        setDragOffset({ x: deltaX, y: deltaY })

        if (onUpdate) {
            onUpdate({
                position: {
                    x: component.position.x + deltaX,
                    y: component.position.y + deltaY,
                    width: component.position.width,
                    height: component.position.height
                }
            })
        }
    }

    // Handle mouse up to stop dragging
    const handleMouseUp = () => {
        setIsDragging(false)
        setDragOffset({ x: 0, y: 0 })
    }

    // Add global mouse event listeners for dragging
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)

            return () => {
                document.removeEventListener('mousemove', handleMouseMove)
                document.removeEventListener('mouseup', handleMouseUp)
            }
        }
    }, [isDragging, dragStart, component.position])

    // Render the actual component based on type
    const renderComponent = () => {
        const { type, props, className, children } = component
        const combinedClassName = `${className || ''} ${isSelected ? 'ring-2 ring-blue-500' : ''} ${isHovered ? 'ring-1 ring-gray-400' : ''}`.trim()

        switch (type) {
            case 'Button':
                return (
                    <button
                        className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${combinedClassName}`}
                        disabled={props.disabled}
                        onClick={props.onClick}
                        {...props}
                    >
                        {children || 'Button'}
                    </button>
                )

            case 'Input':
                return (
                    <input
                        type={props.type || 'text'}
                        placeholder={props.placeholder}
                        disabled={props.disabled}
                        required={props.required}
                        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${combinedClassName}`}
                        {...props}
                    />
                )

            case 'Card':
                return (
                    <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${combinedClassName}`}>
                        <div className="p-6">
                            {props.title && (
                                <h3 className="text-2xl font-semibold leading-none tracking-tight">
                                    {props.title}
                                </h3>
                            )}
                            {props.description && (
                                <p className="text-sm text-muted-foreground mt-2">
                                    {props.description}
                                </p>
                            )}
                            {children && (
                                <div className="mt-4">{children}</div>
                            )}
                        </div>
                    </div>
                )

            case 'Badge':
                return (
                    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${combinedClassName}`}>
                        {children || 'Badge'}
                    </div>
                )

            case 'Avatar':
                return (
                    <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${combinedClassName}`}>
                        {props.src ? (
                            <img
                                src={props.src}
                                alt={props.alt || ''}
                                className="aspect-square h-full w-full"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium">
                                {props.fallback || 'A'}
                            </div>
                        )}
                    </div>
                )

            case 'Text':
                return (
                    <p className={`text-sm ${combinedClassName}`}>
                        {children || 'Text content'}
                    </p>
                )

            case 'Heading':
                return (
                    <h1 className={`text-2xl font-bold ${combinedClassName}`}>
                        {children || 'Heading'}
                    </h1>
                )

            case 'Image':
                return (
                    <img
                        src={props.src || 'https://via.placeholder.com/300x200'}
                        alt={props.alt || ''}
                        className={`rounded-md ${combinedClassName}`}
                        {...props}
                    />
                )

            case 'Container':
                return (
                    <div className={`${combinedClassName}`}>
                        {children || 'Container'}
                    </div>
                )

            default:
                return (
                    <div className={`${combinedClassName}`} {...props}>
                        {children || `${type} Component`}
                    </div>
                )
        }
    }

    return (
        <div
            ref={elementRef}
            className={`absolute cursor-move select-none ${isSelected ? 'z-10' : 'z-0'}`}
            style={{
                left: component.position.x + dragOffset.x,
                top: component.position.y + dragOffset.y,
                width: component.position.width,
                height: component.position.height,
                transform: isDragging ? 'scale(1.02)' : 'scale(1)',
                transition: isDragging ? 'none' : 'transform 0.1s ease'
            }}
            onMouseDown={handleMouseDown}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Selection handles */}
            {isSelected && (
                <>
                    {/* Corner resize handles */}
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-nw-resize" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-ne-resize" />
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-sw-resize" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-se-resize" />

                    {/* Edge resize handles */}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-n-resize" />
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-s-resize" />
                    <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-w-resize" />
                    <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-e-resize" />
                </>
            )}

            {/* Component content */}
            <div className="w-full h-full flex items-center justify-center">
                {renderComponent()}
            </div>

            {/* Component label (for debugging) */}
            {(isSelected || isHovered) && (
                <div className="absolute -top-6 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                    {component.type} ({component.id})
                </div>
            )}
        </div>
    )
}
