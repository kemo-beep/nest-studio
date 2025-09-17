import { useState, useEffect } from 'react'
import { ProjectInfo } from '@/shared/types'

interface PreviewWindowProps {
    project: ProjectInfo
}

export function PreviewWindow({ project }: PreviewWindowProps) {
    const [devServerStatus, setDevServerStatus] = useState<'stopped' | 'starting' | 'running' | 'error'>('stopped')
    const [devServerUrl, setDevServerUrl] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        startDevServer()
    }, [project])

    const startDevServer = async () => {
        try {
            setDevServerStatus('starting')
            setError(null)

            const result = await window.electronAPI.devserver.start(project.path)

            if (result.success) {
                setDevServerStatus('running')
                setDevServerUrl(result.data.url)
            } else {
                setDevServerStatus('error')
                setError(result.error || 'Failed to start dev server')
            }
        } catch (err) {
            setDevServerStatus('error')
            setError(err instanceof Error ? err.message : 'Unknown error')
        }
    }

    const stopDevServer = async () => {
        try {
            await window.electronAPI.devserver.stop()
            setDevServerStatus('stopped')
            setDevServerUrl(null)
            setError(null)
        } catch (err) {
            console.error('Failed to stop dev server:', err)
        }
    }

    return (
        <div className="h-full flex flex-col">
            {/* Preview Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${devServerStatus === 'running' ? 'bg-green-500' :
                        devServerStatus === 'starting' ? 'bg-yellow-500' :
                            devServerStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
                        }`}></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Live Preview
                    </span>
                    {devServerUrl && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {devServerUrl}
                        </span>
                    )}
                </div>

                <div className="flex items-center space-x-2">
                    {/* Viewport Controls */}
                    <div className="flex items-center space-x-1">
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </button>
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={startDevServer}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                        title="Refresh Preview"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>

                    {/* Stop Button */}
                    <button
                        onClick={stopDevServer}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                        title="Stop Dev Server"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 relative">
                {devServerStatus === 'starting' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                        <div className="text-center">
                            <div className="spinner mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-400">Starting dev server...</p>
                        </div>
                    </div>
                )}

                {devServerStatus === 'error' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                        <div className="text-center max-w-md">
                            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Failed to Start Dev Server
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                {error}
                            </p>
                            <button
                                onClick={startDevServer}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                )}

                {devServerStatus === 'running' && devServerUrl && (
                    <iframe
                        src={devServerUrl}
                        className="w-full h-full border-0"
                        title="Live Preview"
                        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                    />
                )}

                {devServerStatus === 'stopped' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Preview Not Available
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Start the dev server to see your project preview
                            </p>
                            <button
                                onClick={startDevServer}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Start Dev Server
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
