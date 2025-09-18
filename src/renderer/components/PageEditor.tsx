import { useState, useEffect, useRef } from 'react'
import { ProjectFile } from './ProjectExplorer'

interface PageElement {
    id: string
    type: string
    name: string
    props: Record<string, any>
    children: PageElement[]
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
            if (type === 'element-selected') {
                onElementSelect(payload)
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

    const injectScript = () => {
        const iframe = iframeRef.current
        if (!iframe?.contentWindow) return

        setTimeout(() => {
            if (!iframe?.contentWindow) return

            const script = iframe.contentWindow.document.createElement('script')
            script.textContent = `
                (function() {
                    let idCounter = 0;
                    function injectIds(element) {
                        if (!element.hasAttribute('data-element-id')) {
                            element.setAttribute('data-element-id', 'el-' + idCounter++);
                        }
                        for (const child of element.children) {
                            injectIds(child);
                        }
                    }
                    injectIds(document.body);

                    let overlay = null;

                    function createOverlay() {
                        const el = document.createElement('div');
                        el.style.position = 'absolute';
                        el.style.border = '2px solid #3b82f6';
                        el.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                        el.style.pointerEvents = 'none';
                        el.style.zIndex = '9999';
                        el.style.transition = 'all 0.1s ease-in-out';
                        document.body.appendChild(el);
                        return el;
                    }

                    function getElementById(id) {
                        return document.querySelector('[data-element-id="' + id + '"]');
                    }

                    function highlightElement(element) {
                        if (!overlay) {
                            overlay = createOverlay();
                        }
                        if (element) {
                            const rect = element.getBoundingClientRect();
                            overlay.style.width = rect.width + 'px';
                            overlay.style.height = rect.height + 'px';
                            overlay.style.top = rect.top + window.scrollY + 'px';
                            overlay.style.left = rect.left + window.scrollX + 'px';
                            overlay.style.display = 'block';
                        } else {
                            overlay.style.display = 'none';
                        }
                    }

                    document.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        const element = e.target.closest('[data-element-id]');
                        if (!element) return;

                        const id = element.getAttribute('data-element-id');
                        const props = {};
                        for (const attr of element.attributes) {
                            props[attr.name] = attr.value;
                        }

                        window.parent.postMessage({
                            type: 'element-selected',
                            payload: {
                                id: id,
                                name: element.tagName.toLowerCase(),
                                type: element.tagName.toLowerCase(),
                                props: props,
                                className: element.className,
                                content: element.innerText,
                            }
                        }, '*');
                        
                        highlightElement(element);
                    }, true);

                    window.addEventListener('message', (event) => {
                        const { type, payload } = event.data;
                        if (type === 'highlight-element') {
                            const elementToHighlight = getElementById(payload.id);
                            highlightElement(elementToHighlight);
                        }
                    });
                })();
            `
            iframe.contentWindow.document.body.appendChild(script)
        }, 1000)
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
                    onLoad={injectScript}
                />
            </div>
        </div>
    )
}
