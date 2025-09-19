import { useState, useEffect } from 'react'
import { ProjectInfo } from '@/shared/types'
import { PreviewWindow } from './PreviewWindow'

interface PreviewPanelProps {
    project: ProjectInfo
    isVisible: boolean
    onToggle: () => void
}

export function PreviewPanel({ project, isVisible, onToggle }: PreviewPanelProps) {
    const [devServerUrl, setDevServerUrl] = useState<string | null>(null)
    const [devServerStatus, setDevServerStatus] = useState<'stopped' | 'starting' | 'running' | 'error'>('stopped')
    const [isMinimized, setIsMinimized] = useState(false)

    useEffect(() => {
        // Check dev server status when component mounts
        checkDevServerStatus()

        // Set up periodic status checking
        const interval = setInterval(checkDevServerStatus, 5000)

        return () => clearInterval(interval)
    }, [project])

    const checkDevServerStatus = async () => {
        try {
            if (window.electronAPI?.devserver?.getStatus) {
                const result = await window.electronAPI.devserver.getStatus()
                if (result.success) {
                    setDevServerStatus(result.data?.status || 'stopped')
                    setDevServerUrl(result.data?.url || null)
                } else {
                    setDevServerStatus('stopped')
                    setDevServerUrl(null)
                }
            }
        } catch (error) {
            console.error('Error checking dev server status:', error)
            setDevServerStatus('error')
        }
    }

    const startDevServer = async () => {
        try {
            setDevServerStatus('starting')
            if (window.electronAPI?.devserver?.start) {
                const result = await window.electronAPI.devserver.start(project.path)
                if (result.success) {
                    setDevServerStatus('running')
                    setDevServerUrl(result.data?.url || null)
                } else {
                    setDevServerStatus('error')
                    console.error('Failed to start dev server:', result.error)
                }
            }
        } catch (error) {
            console.error('Error starting dev server:', error)
            setDevServerStatus('error')
        }
    }

    const stopDevServer = async () => {
        try {
            if (window.electronAPI?.devserver?.stop) {
                const result = await window.electronAPI.devserver.stop()
                if (result.success) {
                    setDevServerStatus('stopped')
                    setDevServerUrl(null)
                }
            }
        } catch (error) {
            console.error('Error stopping dev server:', error)
        }
    }

    const getStatusColor = () => {
        switch (devServerStatus) {
            case 'running':
                return 'text-green-500'
            case 'starting':
                return 'text-yellow-500'
            case 'error':
                return 'text-red-500'
            default:
                return 'text-gray-500'
        }
    }

    const getStatusText = () => {
        switch (devServerStatus) {
            case 'running':
                return 'Running'
            case 'starting':
                return 'Starting...'
            case 'error':
                return 'Error'
            default:
                return 'Stopped'
        }
    }

    if (!isVisible) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Preview Panel
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Click the preview button to see your project
                    </p>
                    <button
                        onClick={onToggle}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Show Preview
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Live Preview
                    </h3>

                    {/* Status Indicator */}
                    <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${devServerStatus === 'running' ? 'bg-green-500' :
                            devServerStatus === 'starting' ? 'bg-yellow-500 animate-pulse' :
                                devServerStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
                            }`}></div>
                        <span className={`text-sm font-medium ${getStatusColor()}`}>
                            {getStatusText()}
                        </span>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    {/* Dev Server Controls */}
                    {devServerStatus === 'stopped' && (
                        <button
                            onClick={startDevServer}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                            Start Server
                        </button>
                    )}

                    {devServerStatus === 'running' && (
                        <button
                            onClick={stopDevServer}
                            className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            Stop Server
                        </button>
                    )}

                    {/* Minimize Button */}
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        title={isMinimized ? "Expand" : "Minimize"}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                    </button>

                    {/* Close Button */}
                    <button
                        onClick={onToggle}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        title="Close Preview"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Content */}
            {isMinimized ? (
                <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Preview minimized
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex-1">
                    {devServerStatus === 'running' && devServerUrl ? (
                        <PreviewWindow
                            project={project}
                            devServerUrl={devServerUrl}
                        />
                    ) : devServerStatus === 'starting' ? (
                        <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                            <div className="text-center">
                                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    Starting Dev Server
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    This may take a few moments...
                                </p>
                            </div>
                        </div>
                    ) : devServerStatus === 'error' ? (
                        <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    Dev Server Error
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    Failed to start the development server
                                </p>
                                <button
                                    onClick={startDevServer}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    Start Dev Server
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    Click the button below to start the development server
                                </p>
                                <button
                                    onClick={startDevServer}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Start Server
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
