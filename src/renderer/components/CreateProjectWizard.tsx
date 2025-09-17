import React, { useState, useEffect } from 'react'

interface CreateProjectWizardProps {
    onClose: () => void
    onCreateProject: (options: any) => void
}

export function CreateProjectWizard({ onClose, onCreateProject }: CreateProjectWizardProps) {
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        name: '',
        directory: '',
        nextjsVersion: '15',
        typescript: true,
        appRouter: true,
        tailwind: true,
        shadcn: true,
        eslint: true,
        prettier: true
    })
    const [isCreating, setIsCreating] = useState(false)
    const [apiReady, setApiReady] = useState(false)

    useEffect(() => {
        // Check if the Electron API is available
        const checkAPI = () => {
            if (window.electronAPI?.project?.create && window.electronAPI?.dialog?.openDirectory) {
                console.log('Electron API is ready')
                setApiReady(true)
            } else {
                console.log('Electron API not ready yet, retrying...')
                console.log('window.electronAPI:', window.electronAPI)
                console.log('project.create:', window.electronAPI?.project?.create)
                console.log('dialog.openDirectory:', window.electronAPI?.dialog?.openDirectory)
                setTimeout(checkAPI, 100)
            }
        }

        checkAPI()
    }, [])

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleNext = () => {
        if (step < 3) {
            setStep(step + 1)
        }
    }

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1)
        }
    }

    const handleSubmit = async () => {
        console.log('=== CREATE PROJECT DEBUG START ===')
        console.log('Form data:', formData)
        console.log('onCreateProject function:', onCreateProject)
        console.log('API ready:', apiReady)
        console.log('window.electronAPI:', window.electronAPI)

        if (!apiReady) {
            console.error('API not ready yet, cannot create project')
            alert('Please wait for the application to fully load before creating a project.')
            return
        }

        setIsCreating(true)
        try {
            console.log('Calling onCreateProject...')
            await onCreateProject(formData)
            console.log('Project created successfully')
        } catch (error) {
            console.error('Failed to create project:', error)
            // Show error message to user
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
            alert(`Failed to create project: ${errorMessage}`)
        } finally {
            setIsCreating(false)
        }
        console.log('=== CREATE PROJECT DEBUG END ===')
    }

    const handleDirectorySelect = async () => {
        if (!apiReady) {
            console.log('API not ready yet, please wait...')
            return
        }

        try {
            console.log('Opening directory dialog...')
            const result = await window.electronAPI.dialog.openDirectory()
            console.log('Dialog result:', result)

            if (result.success) {
                setFormData(prev => ({ ...prev, directory: result.data }))
                console.log('Directory set to:', result.data)
            } else {
                console.log('Dialog cancelled or failed:', result.error)
                // Don't show alert for user cancellation
                if (result.error && result.error !== 'No directory selected') {
                    console.error('Dialog error:', result.error)
                }
            }
        } catch (error) {
            console.error('Failed to select directory:', error)
            alert(`Failed to select directory: ${error}`)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Create New Project
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

                    {/* Progress Steps */}
                    <div className="mt-4 flex items-center space-x-4">
                        {[1, 2, 3].map((stepNumber) => (
                            <div key={stepNumber} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= stepNumber
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                                    }`}>
                                    {stepNumber}
                                </div>
                                {stepNumber < 3 && (
                                    <div className={`w-8 h-0.5 ml-2 ${step > stepNumber ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-6 overflow-y-auto max-h-[60vh]">
                    {step === 1 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                Project Details
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Project Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="my-nextjs-app"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Directory
                                </label>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={formData.directory}
                                        onChange={(e) => handleInputChange('directory', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="/path/to/projects"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            console.log('Browse button clicked!')
                                            handleDirectorySelect()
                                        }}
                                        disabled={!apiReady}
                                        className={`px-4 py-2 rounded-md ${apiReady
                                            ? 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
                                            : 'bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                            }`}
                                    >
                                        {apiReady ? 'Browse' : 'Loading...'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                Next.js Configuration
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Next.js Version
                                </label>
                                <select
                                    value={formData.nextjsVersion}
                                    onChange={(e) => handleInputChange('nextjsVersion', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="13">Next.js 13</option>
                                    <option value="14">Next.js 14</option>
                                    <option value="15">Next.js 15</option>
                                </select>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="typescript"
                                        checked={formData.typescript}
                                        onChange={(e) => handleInputChange('typescript', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="typescript" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                        TypeScript
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="appRouter"
                                        checked={formData.appRouter}
                                        onChange={(e) => handleInputChange('appRouter', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="appRouter" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                        App Router (recommended)
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                Additional Tools
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="tailwind"
                                        checked={formData.tailwind}
                                        onChange={(e) => handleInputChange('tailwind', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="tailwind" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                        Tailwind CSS
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="shadcn"
                                        checked={formData.shadcn}
                                        onChange={(e) => handleInputChange('shadcn', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="shadcn" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                        shadcn/ui components
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="eslint"
                                        checked={formData.eslint}
                                        onChange={(e) => handleInputChange('eslint', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="eslint" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                        ESLint
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="prettier"
                                        checked={formData.prettier}
                                        onChange={(e) => handleInputChange('prettier', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="prettier" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                        Prettier
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                    <button
                        onClick={step === 1 ? onClose : handleBack}
                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                        {step === 1 ? 'Cancel' : 'Back'}
                    </button>

                    <div className="flex space-x-2">
                        {step < 3 ? (
                            <button
                                onClick={handleNext}
                                disabled={!formData.name || !formData.directory}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isCreating || !apiReady}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCreating ? (
                                    <div className="flex items-center">
                                        <div className="spinner mr-2"></div>
                                        Creating...
                                    </div>
                                ) : !apiReady ? (
                                    'Loading...'
                                ) : (
                                    'Create Project'
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
