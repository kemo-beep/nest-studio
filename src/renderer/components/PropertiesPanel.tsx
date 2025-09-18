import { useState, useEffect } from 'react'
import { ProjectInfo } from '@/shared/types'
import { TailwindClassesEditor } from './TailwindClassesEditor'

interface PageElement {
    id: string
    type: string
    name: string
    props: Record<string, any>
    children: PageElement[]
    path: number[]
    className?: string
    content?: string
}

interface PropertiesPanelProps {
    project: ProjectInfo
    selectedElement?: PageElement | null
    onElementUpdate?: (elementId: string, updates: Partial<PageElement>) => void
}

export function PropertiesPanel({ project, selectedElement, onElementUpdate }: PropertiesPanelProps) {
    const [activeTab, setActiveTab] = useState<'styles' | 'props'>('styles')

    const handlePropChange = (propName: string, propValue: any) => {
        if (selectedElement && onElementUpdate) {
            const updates = {
                props: { ...selectedElement.props, [propName]: propValue }
            }
            onElementUpdate(selectedElement.id, updates)
        }
    }

    const handleClassNameChange = (newClassName: string) => {
        if (selectedElement && onElementUpdate) {
            onElementUpdate(selectedElement.id, { className: newClassName })
        }
    }

    const handleContentChange = (newContent: string) => {
        if (selectedElement && onElementUpdate) {
            onElementUpdate(selectedElement.id, { content: newContent })
        }
    }

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Properties</h2>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('styles')}
                    className={`flex-1 px-3 py-2 text-sm font-medium ${
                        activeTab === 'styles'
                            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    Styles
                </button>
                <button
                    onClick={() => setActiveTab('props')}
                    className={`flex-1 px-3 py-2 text-sm font-medium ${
                        activeTab === 'props'
                            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    Attributes
                </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {selectedElement ? (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Selected Element</h3>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedElement.name}</p>
                        </div>

                        {activeTab === 'styles' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tailwind Classes
                                </label>
                                <TailwindClassesEditor
                                    value={selectedElement.className || ''}
                                    onChange={handleClassNameChange}
                                />
                            </div>
                        )}

                        {activeTab === 'props' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Content
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedElement.content || ''}
                                        onChange={(e) => handleContentChange(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                {Object.entries(selectedElement.props).map(([key, value]) => {
                                    if (key === 'className') return null // Handled separately
                                    return (
                                        <div key={key}>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                {key}
                                            </label>
                                            <input
                                                type="text"
                                                value={value}
                                                onChange={(e) => handlePropChange(key, e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 pt-10">
                        <div className="text-4xl mb-4">👆</div>
                        <p>Select an element on the canvas to edit its properties.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
