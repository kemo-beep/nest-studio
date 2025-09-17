import { useState } from 'react'
import { useProject } from '../contexts/ProjectContext'
import { CreateProjectWizard } from './CreateProjectWizard'
import { ImportProjectDialog } from './ImportProjectDialog'

export function WelcomeScreen() {
    const { createProject, importProject, isLoading } = useProject()
    const [showCreateWizard, setShowCreateWizard] = useState(false)
    const [showImportDialog, setShowImportDialog] = useState(false)

    const handleCreateProject = async (options: any) => {
        try {
            await createProject(options)
            setShowCreateWizard(false)
        } catch (error) {
            console.error('Failed to create project:', error)
        }
    }

    const handleImportProject = async (projectPath: string) => {
        try {
            await importProject(projectPath)
            setShowImportDialog(false)
        } catch (error) {
            console.error('Failed to import project:', error)
        }
    }

    return (
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="text-center max-w-2xl mx-auto p-8">
                {/* Logo and Title */}
                <div className="mb-8">
                    <div className="w-20 h-20 mx-auto mb-6 bg-blue-600 rounded-2xl flex items-center justify-center">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Nest Studio
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
                        Visual Builder for Next.js + Tailwind + shadcn/ui
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                        Create and edit your Next.js projects with a powerful visual interface
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                    <button
                        onClick={() => setShowCreateWizard(true)}
                        disabled={isLoading}
                        className="w-full px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <div className="spinner mr-2"></div>
                                Creating Project...
                            </div>
                        ) : (
                            'Create New Project'
                        )}
                    </button>

                    <button
                        onClick={() => setShowImportDialog(true)}
                        disabled={isLoading}
                        className="w-full px-8 py-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg border border-gray-200 dark:border-gray-600"
                    >
                        Import Existing Project
                    </button>
                </div>

                {/* Features */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    <div className="p-4">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-3">
                            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Visual Editor</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Drag and drop components, edit properties visually, and see changes in real-time
                        </p>
                    </div>

                    <div className="p-4">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-3">
                            <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Live Preview</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            See your changes instantly with integrated Next.js dev server and hot reload
                        </p>
                    </div>

                    <div className="p-4">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-3">
                            <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Code Sync</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Bidirectional sync between visual editor and source code with AST manipulation
                        </p>
                    </div>
                </div>

                {/* Modals */}
                {showCreateWizard && (
                    <CreateProjectWizard
                        onClose={() => setShowCreateWizard(false)}
                        onCreateProject={handleCreateProject}
                    />
                )}

                {showImportDialog && (
                    <ImportProjectDialog
                        onClose={() => setShowImportDialog(false)}
                        onImportProject={handleImportProject}
                    />
                )}
            </div>
        </div>
    )
}
