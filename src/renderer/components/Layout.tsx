import { useState, useEffect } from 'react'
import { ProjectInfo } from '@/shared/types'
import { Sidebar } from './Sidebar'
import { Canvas } from './Canvas'
import { PropertiesPanel } from './PropertiesPanel'
import { PreviewWindow } from './PreviewWindow'

interface LayoutProps {
    project: ProjectInfo
}

export function Layout({ project }: LayoutProps) {
    const [sidebarWidth, setSidebarWidth] = useState(300)
    const [propertiesWidth, setPropertiesWidth] = useState(300)
    const [showPreview, setShowPreview] = useState(false)
    const [isResizing, setIsResizing] = useState<'left' | 'right' | null>(null)

    const handleMouseDown = (side: 'left' | 'right') => (e: React.MouseEvent) => {
        setIsResizing(side)
        e.preventDefault()
    }

    const handleMouseMove = (e: MouseEvent) => {
        if (!isResizing) return

        const containerWidth = window.innerWidth
        const newWidth = isResizing === 'left'
            ? e.clientX
            : containerWidth - e.clientX

        if (isResizing === 'left') {
            setSidebarWidth(Math.max(200, Math.min(600, newWidth)))
        } else {
            setPropertiesWidth(Math.max(200, Math.min(600, newWidth)))
        }
    }

    const handleMouseUp = () => {
        setIsResizing(null)
    }

    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
            document.body.style.cursor = 'col-resize'
            document.body.style.userSelect = 'none'
        } else {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
            document.body.style.cursor = ''
            document.body.style.userSelect = ''
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
            document.body.style.cursor = ''
            document.body.style.userSelect = ''
        }
    }, [isResizing])

    return (
        <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar */}
            <div
                className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0"
                style={{ width: sidebarWidth }}
            >
                <Sidebar project={project} />
            </div>

            {/* Resize Handle - Left */}
            <div
                className="w-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 cursor-col-resize flex-shrink-0"
                onMouseDown={handleMouseDown('left')}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Canvas */}
                <div className="flex-1 relative">
                    <Canvas project={project} />
                </div>

                {/* Preview Toggle */}
                <div className="absolute bottom-4 right-4 z-10">
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                        title={showPreview ? 'Hide Preview' : 'Show Preview'}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Resize Handle - Right */}
            <div
                className="w-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 cursor-col-resize flex-shrink-0"
                onMouseDown={handleMouseDown('right')}
            />

            {/* Right Properties Panel */}
            <div
                className="bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex-shrink-0"
                style={{ width: propertiesWidth }}
            >
                <PropertiesPanel project={project} />
            </div>

            {/* Preview Window */}
            {showPreview && (
                <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-4/5 h-4/5 max-w-6xl">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Live Preview
                            </h3>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="h-full p-4">
                            <PreviewWindow project={project} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
