import { useState } from 'react'

interface ImportProjectDialogProps {
    onClose: () => void
    onImportProject: (projectPath: string) => void
}

export function ImportProjectDialog({ onClose, onImportProject }: ImportProjectDialogProps) {
    const [projectPath, setProjectPath] = useState('')
    const [isDetecting, setIsDetecting] = useState(false)
    const [detectedProject, setDetectedProject] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const handleDirectorySelect = async () => {
        try {
            const result = await window.electronAPI.dialog.openDirectory()
            if (result.success) {
                setProjectPath(result.data)
                setError(null)
                await detectProject(result.data)
            }
        } catch (error) {
            console.error('Failed to select directory:', error)
            setError('Failed to select directory')
        }
    }

    const detectProject = async (path: string) => {
        if (!path) return

        setIsDetecting(true)
        setError(null)

        try {
            const result = await window.electronAPI.project.detect(path)
            if (result.success) {
                setDetectedProject(result.data)
            } else {
                setError(result.error || 'Failed to detect project')
                setDetectedProject(null)
            }
        } catch (error) {
            setError('Failed to detect project')
            setDetectedProject(null)
        } finally {
            setIsDetecting(false)
        }
    }

    const handleImport = async () => {
        if (!projectPath || !detectedProject) return

        try {
            await onImportProject(projectPath)
        } catch (error) {
            console.error('Failed to import project:', error)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Import Existing Project
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-6 overflow-y-auto max-h-[60vh]">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Project Directory
                            </label>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={projectPath}
                                    onChange={(e) => setProjectPath(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="/path/to/your/nextjs-project"
                                />
                                <button
                                    type="button"
                                    onClick={handleDirectorySelect}
                                    className="px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500"
                                >
                                    Browse
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isDetecting && (
                            <div className="flex items-center justify-center py-8">
                                <div className="flex items-center">
                                    <div className="spinner mr-3"></div>
                                    <span className="text-gray-600 dark:text-gray-300">Detecting project...</span>
                                </div>
                            </div>
                        )}

                        {detectedProject && (
                            <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-md p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                                            Project Detected Successfully
                                        </h3>
                                        <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p><strong>Name:</strong> {detectedProject.name}</p>
                                                    <p><strong>Next.js Version:</strong> {detectedProject.nextjsVersion}</p>
                                                    <p><strong>TypeScript:</strong> {detectedProject.typescript ? 'Yes' : 'No'}</p>
                                                </div>
                                                <div>
                                                    <p><strong>App Router:</strong> {detectedProject.appRouter ? 'Yes' : 'No'}</p>
                                                    <p><strong>Tailwind CSS:</strong> {detectedProject.tailwind ? 'Yes' : 'No'}</p>
                                                    <p><strong>shadcn/ui:</strong> {detectedProject.shadcn ? 'Yes' : 'No'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={!projectPath || !detectedProject}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Import Project
                    </button>
                </div>
            </div>
        </div>
    )
}
