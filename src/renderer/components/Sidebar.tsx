import { useState } from 'react'
import { ProjectInfo } from '@/shared/types'
import { ComponentLibrary } from './ComponentLibrary'

interface SidebarProps {
    project: ProjectInfo
}

export function Sidebar({ project }: SidebarProps) {
    const [activeTab, setActiveTab] = useState<'components' | 'files' | 'layers'>('components')

    return (
        <div className="h-full flex flex-col">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('components')}
                    className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'components'
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    Components
                </button>
                <button
                    onClick={() => setActiveTab('files')}
                    className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'files'
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    Files
                </button>
                <button
                    onClick={() => setActiveTab('layers')}
                    className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'layers'
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    Layers
                </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
                {activeTab === 'components' && <ComponentLibrary project={project} />}
                {activeTab === 'files' && <FileExplorer project={project} />}
                {activeTab === 'layers' && <LayerPanel project={project} />}
            </div>
        </div>
    )
}


function FileExplorer({ project: _project }: { project: ProjectInfo }) {
    return (
        <div className="h-full p-4">
            <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Project Files
                </div>
                <div className="space-y-1">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        📁 src/
                    </div>
                    <div className="ml-4 space-y-1">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            📁 app/
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            📁 components/
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            📁 lib/
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function LayerPanel({ project: _project }: { project: ProjectInfo }) {
    return (
        <div className="h-full p-4">
            <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Layers
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    No elements on canvas
                </div>
            </div>
        </div>
    )
}
