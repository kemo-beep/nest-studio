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

        const url = `${devServerUrl}${relativePath}`
        console.log('[PageEditor] Generated URL:', url)
        return url
    }

    // Function to clear highlight in iframe
    const clearHighlight = () => {
        const iframe = iframeRef.current
        if (iframe?.contentWindow) {
            iframe.contentWindow.postMessage({
                type: 'clear-highlight',
                payload: {}
            }, '*')
        }
    }

    // Clear highlight when selectedElement changes
    useEffect(() => {
        if (selectedElement) {
            // If we have a studio ID, highlight that element
            const iframe = iframeRef.current
            if (iframe?.contentWindow && selectedElement.id.startsWith('el-')) {
                iframe.contentWindow.postMessage({
                    type: 'highlight-element',
                    payload: { elementId: selectedElement.id }
                }, '*')
            }
        } else {
            // Clear highlight if no element is selected
            clearHighlight()
        }
    }, [selectedElement])

    useEffect(() => {
        const iframe = iframeRef.current
        if (!iframe) return

        const handleMessage = (event: MessageEvent) => {
            console.log('[PageEditor] Message received:', event.data)
            console.log('[PageEditor] Event source:', event.source)
            console.log('[PageEditor] Iframe contentWindow:', iframe.contentWindow)
            console.log('[PageEditor] Sources match:', event.source === iframe.contentWindow)

            if (event.source !== iframe.contentWindow) {
                console.log('[PageEditor] Message not from iframe, ignoring')
                return
            }

            const { type, payload } = event.data
            console.log('[PageEditor] Message type:', type, 'payload:', payload)

            if (type === 'iframe-ready') {
                console.log('[PageEditor] Iframe is ready and accessible!')
                // Show a visual indicator in the debug overlay
                const debugOverlay = document.querySelector('.debug-overlay')
                if (debugOverlay) {
                    debugOverlay.innerHTML += '<div style="color: green;">✓ Iframe Ready</div>'
                }
            } else if (type === 'element-clicked') {
                console.log('[PageEditor] Element clicked in iframe:', payload)
                // Convert the simple click data to our PageElement format
                const element: PageElement = {
                    id: payload.studioId || `clicked-${Date.now()}`,
                    type: payload.tagName.toLowerCase(),
                    name: payload.tagName.toLowerCase(),
                    props: {
                        className: payload.className,
                        id: payload.id
                    },
                    children: [],
                    position: { x: 0, y: 0, width: 0, height: 0 },
                    path: [],
                    className: payload.className,
                    content: payload.textContent
                }
                console.log('[PageEditor] Calling onElementSelect with:', element)
                console.log('[PageEditor] onElementSelect function:', onElementSelect)
                try {
                    onElementSelect(element)
                    console.log('[PageEditor] onElementSelect called successfully')

                    // Store the selected element's studio ID for highlighting
                    if (payload.studioId) {
                        // Send highlight message to iframe
                        iframe.contentWindow?.postMessage({
                            type: 'highlight-element',
                            payload: { elementId: payload.studioId }
                        }, '*')
                    }
                } catch (error) {
                    console.error('[PageEditor] Error calling onElementSelect:', error)
                }

                // Show a visual indicator in the debug overlay
                const debugOverlay = document.querySelector('.debug-overlay')
                if (debugOverlay) {
                    debugOverlay.innerHTML += `<div style="color: blue;">✓ Element Clicked: ${payload.tagName}</div>`
                }
            } else if (type === 'element-selected') {
                console.log('[PageEditor] Calling onElementSelect with:', payload)
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
        if (!iframe?.contentWindow) {
            console.log('[PageEditor] No iframe contentWindow available')
            return
        }

        console.log('[PageEditor] Starting script injection...')

        const injectWhenReady = () => {
            try {
                console.log('[PageEditor] Checking iframe readiness...')
                console.log('[PageEditor] iframe.contentWindow:', !!iframe?.contentWindow)
                console.log('[PageEditor] iframe.contentWindow.document:', !!iframe?.contentWindow?.document)
                console.log('[PageEditor] iframe.contentWindow.document.body:', !!iframe?.contentWindow?.document?.body)

                if (!iframe?.contentWindow?.document?.body) {
                    console.log('[PageEditor] iframe not ready, retrying in 100ms...')
                    setTimeout(injectWhenReady, 100)
                    return
                }

                console.log('[PageEditor] iframe is ready, injecting script...')

                // Remove any existing studio script to avoid conflicts
                const existingScript = iframe.contentWindow.document.querySelector('script[data-studio-script]')
                if (existingScript) {
                    console.log('[PageEditor] Removing existing script')
                    existingScript.remove()
                }

                const script = iframe.contentWindow.document.createElement('script')
                script.setAttribute('data-studio-script', 'true')
                script.textContent = `
                (function() {
                        console.log('[StudioScript] Initializing element selection...');

                    let idCounter = 0;
                        let overlay = null;
                        let isInitialized = false;

                    function injectIds(element) {
                        if (!element.hasAttribute('data-element-id')) {
                            element.setAttribute('data-element-id', 'el-' + idCounter++);
                        }
                        for (const child of element.children) {
                            injectIds(child);
                        }
                    }

                    function createOverlay() {
                        const el = document.createElement('div');
                        el.style.position = 'absolute';
                        el.style.border = '2px solid #3b82f6';
                        el.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                        el.style.pointerEvents = 'none';
                        el.style.zIndex = '9999';
                        el.style.transition = 'all 0.1s ease-in-out';
                            el.style.display = 'none';
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

                        function handleElementClick(e) {
                            console.log('[StudioScript] Click event fired.');
                        e.preventDefault();
                        e.stopPropagation();
                        
                        const element = e.target.closest('[data-element-id]');
                        if (!element) {
                                console.log('[StudioScript] No element with data-element-id found.');
                            return;
                        }

                        const id = element.getAttribute('data-element-id');
                            console.log('[StudioScript] Element selected:', id);

                            // Extract all attributes
                        const props = {};
                            for (const attr of Array.from(element.attributes)) {
                            props[attr.name] = attr.value;
                        }

                            // Get computed styles for common CSS properties
                            const computedStyles = window.getComputedStyle(element);
                            const commonStyles = {
                                display: computedStyles.display,
                                position: computedStyles.position,
                                width: computedStyles.width,
                                height: computedStyles.height,
                                backgroundColor: computedStyles.backgroundColor,
                                color: computedStyles.color,
                                fontSize: computedStyles.fontSize,
                                fontFamily: computedStyles.fontFamily,
                                fontWeight: computedStyles.fontWeight,
                                textAlign: computedStyles.textAlign,
                                padding: computedStyles.padding,
                                margin: computedStyles.margin,
                                border: computedStyles.border,
                                borderRadius: computedStyles.borderRadius,
                                boxShadow: computedStyles.boxShadow,
                                opacity: computedStyles.opacity,
                                zIndex: computedStyles.zIndex,
                                transform: computedStyles.transform,
                                transition: computedStyles.transition
                            };

                            // Add computed styles to props
                            Object.entries(commonStyles).forEach(([key, value]) => {
                                if (value && value !== 'none' && value !== 'auto') {
                                    props['style_' + key] = value;
                                }
                            });

                            const rect = element.getBoundingClientRect();

                            // Send message to parent window
                        window.parent.postMessage({
                            type: 'element-selected',
                            payload: {
                                id: id,
                                name: element.tagName.toLowerCase(),
                                type: element.tagName.toLowerCase(),
                                props: props,
                                    children: [],
                                    position: {
                                        x: rect.left,
                                        y: rect.top,
                                        width: rect.width,
                                        height: rect.height
                                    },
                                    path: [],
                                className: element.className,
                                    content: element.innerText || element.textContent || '',
                                    tagName: element.tagName,
                                    nodeType: element.nodeType,
                                    // Additional useful properties
                                    offsetWidth: element.offsetWidth,
                                    offsetHeight: element.offsetHeight,
                                    scrollWidth: element.scrollWidth,
                                    scrollHeight: element.scrollHeight,
                                    clientWidth: element.clientWidth,
                                    clientHeight: element.clientHeight
                            }
                        }, '*');
                        
                        highlightElement(element);
                        }

                        function initializeElementSelection() {
                            if (isInitialized) return
                            isInitialized = true
                            
                            console.log('[StudioScript] Initializing element selection...');
                            
                            // Inject IDs into all elements
                            injectIds(document.body);
                            console.log('[StudioScript] IDs injected.');

                            // Add click listener
                            document.addEventListener('click', handleElementClick, true);

                            // Listen for messages from parent
                    window.addEventListener('message', (event) => {
                        const { type, payload } = event.data;
                        if (type === 'highlight-element') {
                            const elementToHighlight = getElementById(payload.id);
                            highlightElement(elementToHighlight);
                                } else if (type === 'update-styles') {
                                    const elementToUpdate = getElementById(payload.elementId);
                                    if (elementToUpdate) {
                                        // Apply styles to the element
                                        Object.entries(payload.styles).forEach(([property, value]) => {
                                            if (value) {
                                                elementToUpdate.style.setProperty(property, value);
                                            }
                                        });
                                    }
                                }
                            });

                            // Notify parent that iframe is ready
                            window.parent.postMessage({
                                type: 'iframe-ready',
                                payload: {}
                            }, '*');

                            console.log('[StudioScript] Element selection initialized.');
                        }

                        // Initialize when DOM is ready
                        if (document.readyState === 'loading') {
                            document.addEventListener('DOMContentLoaded', initializeElementSelection);
                        } else {
                            initializeElementSelection();
                        }
                })();
            `
                iframe.contentWindow.document.body.appendChild(script)
                console.log('[PageEditor] Studio script injected successfully')
            } catch (error) {
                console.error('[PageEditor] Failed to inject script:', error)
                setTimeout(injectWhenReady, 500)
            }
        }

        // Try to inject immediately, then retry if needed
        injectWhenReady()
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
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {file.name}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {file.path}
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            console.log('[PageEditor] Manual script injection triggered')
                            injectScript()
                        }}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Inject Script
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative overflow-hidden bg-gray-50 dark:bg-gray-900">
                <iframe
                    ref={iframeRef}
                    src={getPageUrl()}
                    className="w-full h-full border-0"
                    title="Page Preview"
                    onLoad={() => {
                        console.log('[PageEditor] iframe loaded, URL:', getPageUrl())
                        console.log('[PageEditor] iframe contentWindow:', !!iframeRef.current?.contentWindow)
                        console.log('[PageEditor] iframe document:', !!iframeRef.current?.contentWindow?.document)
                        injectScript()
                    }}
                    onError={(e) => {
                        console.error('[PageEditor] iframe error:', e)
                    }}
                />
                {/* Debug overlay */}
                <div className="debug-overlay absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs p-2 rounded max-h-40 overflow-y-auto">
                    <div>URL: {getPageUrl()}</div>
                    <div>Dev Server: {devServerUrl}</div>
                    <div>Iframe Ready: {iframeRef.current?.contentWindow ? 'Yes' : 'No'}</div>
                    <button
                        onClick={() => {
                            const iframe = iframeRef.current
                            if (iframe?.contentWindow) {
                                try {
                                    console.log('[PageEditor] Testing iframe access...')
                                    console.log('[PageEditor] iframe.contentWindow:', iframe.contentWindow)
                                    console.log('[PageEditor] iframe.contentWindow.document:', iframe.contentWindow.document)
                                    console.log('[PageEditor] iframe.contentWindow.document.body:', iframe.contentWindow.document.body)
                                    console.log('[PageEditor] iframe.contentWindow.document.title:', iframe.contentWindow.document.title)

                                    // Try to access the iframe content
                                    const body = iframe.contentWindow.document.body
                                    if (body) {
                                        console.log('[PageEditor] Body found, adding test element...')
                                        const testDiv = iframe.contentWindow.document.createElement('div')
                                        testDiv.style.cssText = 'position: fixed; top: 10px; left: 10px; background: red; color: white; padding: 10px; z-index: 9999;'
                                        testDiv.textContent = 'IFRAME ACCESSIBLE!'
                                        body.appendChild(testDiv)

                                        // Remove after 3 seconds
                                        setTimeout(() => {
                                            if (testDiv.parentNode) {
                                                testDiv.parentNode.removeChild(testDiv)
                                            }
                                        }, 3000)
                                    }
                                } catch (error) {
                                    console.error('[PageEditor] Error accessing iframe:', error)
                                }
                            }
                        }}
                        className="mt-2 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                    >
                        Test Iframe Access
                    </button>
                </div>
            </div>
        </div>
    )
}
