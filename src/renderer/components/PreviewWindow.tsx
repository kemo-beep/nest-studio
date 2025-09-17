import { useState, useEffect, useRef } from 'react'
import { ProjectInfo } from '@/shared/types'

interface PreviewWindowProps {
    project: ProjectInfo
    devServerUrl?: string
    onClose?: () => void
}

export function PreviewWindow({ project, devServerUrl, onClose }: PreviewWindowProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [viewport, setViewport] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)
    const iframeRef = useRef<HTMLIFrameElement>(null)

    const viewportSizes = {
        mobile: { width: 375, height: 667 },
        tablet: { width: 768, height: 1024 },
        desktop: { width: 1200, height: 800 }
    }

    const currentSize = viewportSizes[viewport]

    useEffect(() => {
        if (devServerUrl) {
            setIsLoading(true)
            setHasError(false)
            setErrorMessage('')
        }
    }, [devServerUrl, refreshKey])

    const handleIframeLoad = () => {
        setIsLoading(false)
        setHasError(false)
    }

    const handleIframeError = () => {
        setIsLoading(false)
        setHasError(true)
        setErrorMessage('Failed to load preview. Make sure the dev server is running.')
    }

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1)
        setIsLoading(true)
    }

    const handleViewportChange = (newViewport: 'mobile' | 'tablet' | 'desktop') => {
        setViewport(newViewport)
    }

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen)
    }

    const openInBrowser = () => {
        if (devServerUrl && window.electronAPI?.shell?.openExternal) {
            window.electronAPI.shell.openExternal(devServerUrl)
        }
    }

    if (!devServerUrl) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No Preview Available
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Start the dev server to see a live preview
                    </p>
                    <button
                        onClick={handleRefresh}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Start Dev Server
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className={`h-full flex flex-col bg-white dark:bg-gray-900 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Preview
                    </h3>

                    {/* Viewport Controls */}
                    <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        <button
                            onClick={() => handleViewportChange('mobile')}
                            className={`px-3 py-1 text-xs rounded-md transition-colors ${viewport === 'mobile'
                                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            📱 Mobile
                        </button>
                        <button
                            onClick={() => handleViewportChange('tablet')}
                            className={`px-3 py-1 text-xs rounded-md transition-colors ${viewport === 'tablet'
                                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            📱 Tablet
                        </button>
                        <button
                            onClick={() => handleViewportChange('desktop')}
                            className={`px-3 py-1 text-xs rounded-md transition-colors ${viewport === 'desktop'
                                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            💻 Desktop
                        </button>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    {/* URL Display */}
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="font-mono">{devServerUrl}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={handleRefresh}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            title="Refresh"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>

                        <button
                            onClick={openInBrowser}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            title="Open in Browser"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </button>

                        <button
                            onClick={toggleFullscreen}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                        </button>

                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                title="Close Preview"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-800 p-4">
                <div
                    className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden transition-all duration-300"
                    style={{
                        width: isFullscreen ? '100%' : currentSize.width,
                        height: isFullscreen ? '100%' : currentSize.height,
                        maxWidth: isFullscreen ? 'none' : '100%',
                        maxHeight: isFullscreen ? 'none' : '100%'
                    }}
                >
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-10">
                            <div className="text-center">
                                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                <p className="text-gray-600 dark:text-gray-400">Loading preview...</p>
                            </div>
                        </div>
                    )}

                    {hasError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-10">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    Preview Error
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    {errorMessage}
                                </p>
                                <button
                                    onClick={handleRefresh}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    )}

                    <iframe
                        ref={iframeRef}
                        key={refreshKey}
                        src={devServerUrl}
                        className="w-full h-full border-0"
                        onLoad={handleIframeLoad}
                        onError={handleIframeError}
                        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                        title="Preview"
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>
                        {viewport} ({currentSize.width}×{currentSize.height})
                    </span>
                    <span>
                        {project.name} - Next.js {project.nextjsVersion}
                    </span>
                </div>
            </div>
        </div>
    )
}