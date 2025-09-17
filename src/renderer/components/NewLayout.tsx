import React, { useState, useEffect } from 'react'
import { ProjectInfo } from '@/shared/types'
import { ProjectExplorer, ProjectFile } from './ProjectExplorer'
import { PageEditor } from './PageEditor'
import { ShadcnComponentLibrary } from './ShadcnComponentLibrary'
import { PropertiesPanel } from './PropertiesPanel'
import { PreviewPanel } from './PreviewPanel'


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

interface NewLayoutProps {
    project: ProjectInfo
}

export function NewLayout({ project }: NewLayoutProps) {
    const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null)
    const [selectedElement, setSelectedElement] = useState<PageElement | null>(null)
    const [devServerStatus, setDevServerStatus] = useState<'stopped' | 'starting' | 'running' | 'error'>('stopped')
    const [devServerError, setDevServerError] = useState<string | null>(null)
    const [showComponentLibrary, setShowComponentLibrary] = useState(true)
    const [showPreview, setShowPreview] = useState(false)

    // Auto-select the main page when project loads
    useEffect(() => {
        if (project?.path && !selectedFile) {
            // Try to find and select the main page.tsx file
            loadMainPage()
        }
    }, [project?.path])

    const loadMainPage = async () => {
        try {
            // Look for app/page.tsx or pages/index.tsx
            const possiblePaths = [
                `${project.path}/app/page.tsx`,
                `${project.path}/pages/index.tsx`,
                `${project.path}/src/app/page.tsx`,
                `${project.path}/src/pages/index.tsx`
            ]

            for (const path of possiblePaths) {
                const result = await window.electronAPI.fs.readFile(path)
                if (result.success) {
                    setSelectedFile({
                        name: 'page.tsx',
                        path: path,
                        type: 'page',
                        isDirectory: false
                    })
                    break
                }
            }
        } catch (error) {
            console.error('Failed to load main page:', error)
        }
    }

    const handleFileSelect = (file: ProjectFile) => {
        setSelectedFile(file)
        setSelectedElement(null) // Clear selected element when switching files
    }

    const handleElementSelect = (element: PageElement) => {
        setSelectedElement(element)
    }

    const handleElementUpdate = (elementId: string, updates: Partial<PageElement>) => {
        // Update the element in the current file
        // This would typically sync back to the file system
        console.log('Element updated:', elementId, updates)
    }

    const handleComponentSelect = (component: ShadcnComponent) => {
        // Add component to the current page
        console.log('Component selected:', component)
        // This would typically add the component to the canvas
    }

    return (
        <div className="h-screen flex bg-gray-100 dark:bg-gray-900">
            {/* Left Sidebar - Project Explorer */}
            <div className="w-64 flex-shrink-0">
                <ProjectExplorer
                    project={project}
                    onFileSelect={handleFileSelect}
                    selectedFile={selectedFile}
                />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                {/* Top Toolbar */}
                <div className="h-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {project.name}
                        </h1>
                        <div className="flex items-center space-x-2">
                            <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600">
                                Save
                            </button>
                            <button className="px-3 py-1 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600">
                                Undo
                            </button>
                            <button className="px-3 py-1 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600">
                                Redo
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setShowComponentLibrary(!showComponentLibrary)}
                            className={`px-3 py-1 text-sm rounded-md ${showComponentLibrary
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                }`}
                        >
                            Components
                        </button>
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className={`px-3 py-1 text-sm rounded-md ${showPreview
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                }`}
                        >
                            Preview
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex">
                    {/* Center - Canvas/Editor */}
                    <div className="flex-1 flex flex-col">
                        {selectedFile ? (
                            <PageEditor
                                file={selectedFile}
                                onElementSelect={handleElementSelect}
                                selectedElement={selectedElement}
                                onElementUpdate={handleElementUpdate}
                            />
                        ) : (
                            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                                <div className="text-center text-gray-500 dark:text-gray-400">
                                    <div className="text-4xl mb-4">📄</div>
                                    <p className="text-lg">Select a file to start editing</p>
                                    <p className="text-sm mt-2">Choose a page or component from the project explorer</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar - Properties Panel */}
                    <div className="w-80 flex-shrink-0">
                        <PropertiesPanel
                            project={project}
                            selectedElement={selectedElement}
                            onElementUpdate={handleElementUpdate}
                        />
                    </div>
                </div>
            </div>

            {/* Right Sidebar - Component Library */}
            {showComponentLibrary && (
                <div className="w-64 flex-shrink-0">
                    <ShadcnComponentLibrary onComponentSelect={handleComponentSelect} />
                </div>
            )}

            {/* Bottom - Preview Panel */}
            {showPreview && (
                <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-4/5 h-4/5 max-w-6xl">
                        <PreviewPanel
                            project={project}
                            devServerStatus={devServerStatus}
                            devServerError={devServerError}
                            onDevServerStatusChange={setDevServerStatus}
                            onDevServerErrorChange={setDevServerError}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
