import { useState, useEffect, useRef } from 'react'
import { ProjectFile } from './ProjectExplorer'

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
    path: number[]
    className?: string
    content?: string
}

interface PageEditorProps {
    file: ProjectFile
    projectPath: string
    devServerUrl: string
    onElementSelect: (element: PageElement) => void
    selectedElement?: PageElement | null
    onElementUpdate: (elementId: string, updates: Partial<PageElement>) => void
}

export function PageEditor({ file, projectPath, devServerUrl, onElementSelect, selectedElement }: PageEditorProps) {
    const [loading] = useState(false)
    const [error] = useState<string | null>(null)
    const iframeRef = useRef<HTMLIFrameElement>(null)

    const getRelativePath = (absolutePath: string) => {
        if (absolutePath.startsWith(projectPath)) {
            return absolutePath.substring(projectPath.length)
        }
        return absolutePath
    }

    const getPageUrl = () => {
        let relativePath = getRelativePath(file.path)

        // Next.js specific path handling
        if (relativePath.startsWith('/src/app')) {
            relativePath = relativePath.substring('/src/app'.length)
        } else if (relativePath.startsWith('/app')) {
            relativePath = relativePath.substring('/app'.length)
        }

        if (relativePath.endsWith('/page.tsx')) {
            relativePath = relativePath.substring(0, relativePath.length - '/page.tsx'.length)
        }
        if (relativePath.endsWith('/layout.tsx')) {
            relativePath = relativePath.substring(0, relativePath.length - '/layout.tsx'.length)
        }
        if (relativePath === '') {
            relativePath = '/'
        }

        return `${devServerUrl}${relativePath}`
    }

    useEffect(() => {
        const iframe = iframeRef.current
        if (!iframe) return

        const handleMessage = (event: MessageEvent) => {
            if (event.source !== iframe.contentWindow) {
                return
            }

            const { type, payload } = event.data
            console.log('PageEditor: Received message:', { type, payload })

            if (type === 'element-selected') {
                console.log('PageEditor: Calling onElementSelect with:', payload)
                onElementSelect(payload)
            } else if (type === 'iframe-ready') {
                console.log('PageEditor: Iframe is ready, sending initialization message')
                // Send initialization message to iframe
                sendMessageToIframe({
                    type: 'init-element-selection',
                    payload: {}
                })
            }
        }

        window.addEventListener('message', handleMessage)

        return () => {
            window.removeEventListener('message', handleMessage)
        }
    }, [onElementSelect])

    useEffect(() => {
        const iframe = iframeRef.current
        if (iframe && selectedElement) {
            iframe.contentWindow?.postMessage({ type: 'highlight-element', payload: { id: selectedElement.id } }, '*')
        }
    }, [selectedElement])

    const sendMessageToIframe = (message: any) => {
        const iframe = iframeRef.current
        if (iframe?.contentWindow) {
            iframe.contentWindow.postMessage(message, '*')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="text-red-500 mb-2">⚠️</div>
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col">
            {/* Page Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {file.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {file.path}
                </p>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative overflow-hidden bg-gray-50 dark:bg-gray-900">
                <iframe
                    ref={iframeRef}
                    src={getPageUrl()}
                    className="w-full h-full border-0"
                    title="Page Preview"
                    sandbox="allow-scripts allow-same-origin"
                />
            </div>
        </div>
    )
}
