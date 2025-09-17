import { useState, useEffect } from 'react'
import { ProjectInfo } from '@/shared/types'

export interface ProjectFile {
    name: string
    path: string
    type: 'page' | 'component' | 'layout' | 'other'
    isDirectory: boolean
    children?: ProjectFile[]
}

interface ProjectExplorerProps {
    project: ProjectInfo
    onFileSelect: (file: ProjectFile) => void
    selectedFile?: ProjectFile | null
}

export function ProjectExplorer({ project, onFileSelect, selectedFile }: ProjectExplorerProps) {
    const [pages, setPages] = useState<ProjectFile[]>([])
    const [components, setComponents] = useState<ProjectFile[]>([])
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<'pages' | 'components'>('pages')

    useEffect(() => {
        if (project?.path) {
            loadProjectStructure()
        }
    }, [project?.path])

    const loadProjectStructure = async () => {
        setLoading(true)
        try {
            // Load pages from app directory
            await loadPages()

            // Load components from components directory
            await loadComponents()

            // Auto-expand important folders
            setExpandedFolders(new Set(['app', 'components', 'lib', 'public']))
        } catch (error) {
            console.error('Failed to load project structure:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadPages = async () => {
        try {
            // Look for app directory (Next.js App Router)
            const appPath = `${project.path}/app`
            const srcAppPath = `${project.path}/src/app`

            let pagesPath = appPath
            if (await isDirectory(srcAppPath)) {
                pagesPath = srcAppPath
            } else if (!(await isDirectory(appPath))) {
                // No app directory found
                setPages([])
                return
            }

            const pages = await findPageFiles(pagesPath, '')
            setPages(pages)
        } catch (error) {
            console.error('Failed to load pages:', error)
            setPages([])
        }
    }

    const loadComponents = async () => {
        try {
            // Look for components directory
            const componentsPath = `${project.path}/components`
            const srcComponentsPath = `${project.path}/src/components`

            let compPath = componentsPath
            if (await isDirectory(srcComponentsPath)) {
                compPath = srcComponentsPath
            } else if (!(await isDirectory(componentsPath))) {
                // No components directory found
                setComponents([])
                return
            }

            const components = await findComponentFiles(compPath, '')
            setComponents(components)
        } catch (error) {
            console.error('Failed to load components:', error)
            setComponents([])
        }
    }

    const findPageFiles = async (dirPath: string, relativePath: string): Promise<ProjectFile[]> => {
        const pages: ProjectFile[] = []

        try {
            const result = await window.electronAPI.fs.readDirectory(dirPath)
            if (!result.success || !result.data) return pages

            for (const item of result.data) {
                const fullPath = `${dirPath}/${item}`
                const isDir = await isDirectory(fullPath)
                const currentRelativePath = relativePath ? `${relativePath}/${item}` : item

                if (isDir) {
                    // Recursively search for page files in subdirectories
                    const subPages = await findPageFiles(fullPath, currentRelativePath)
                    pages.push(...subPages)
                } else if (item === 'page.tsx' || item === 'page.jsx') {
                    // Found a page file
                    pages.push({
                        name: currentRelativePath === 'page.tsx' ? 'Home' : currentRelativePath.replace('/page.tsx', '').replace('/page.jsx', ''),
                        path: fullPath,
                        type: 'page',
                        isDirectory: false
                    })
                }
            }
        } catch (error) {
            console.error(`Failed to search pages in ${dirPath}:`, error)
        }

        return pages
    }

    const findComponentFiles = async (dirPath: string, relativePath: string): Promise<ProjectFile[]> => {
        const components: ProjectFile[] = []

        try {
            const result = await window.electronAPI.fs.readDirectory(dirPath)
            if (!result.success || !result.data) return components

            for (const item of result.data) {
                const fullPath = `${dirPath}/${item}`
                const isDir = await isDirectory(fullPath)
                const currentRelativePath = relativePath ? `${relativePath}/${item}` : item

                if (isDir) {
                    // Recursively search for component files in subdirectories
                    const subComponents = await findComponentFiles(fullPath, currentRelativePath)
                    components.push(...subComponents)
                } else if (item.endsWith('.tsx') || item.endsWith('.jsx')) {
                    // Found a component file
                    const componentName = item.replace(/\.(tsx|jsx)$/, '')
                    components.push({
                        name: componentName,
                        path: fullPath,
                        type: 'component',
                        isDirectory: false
                    })
                }
            }
        } catch (error) {
            console.error(`Failed to search components in ${dirPath}:`, error)
        }

        return components
    }

    const parseProjectStructure = async (items: string[], basePath: string): Promise<ProjectFile[]> => {
        const files: ProjectFile[] = []

        for (const item of items) {
            const fullPath = `${basePath}/${item}`
            const isDirectory = await isDirectory(fullPath)

            if (isDirectory) {
                // Skip node_modules, .next, .git, etc.
                if (['node_modules', '.next', '.git', 'dist', 'build'].includes(item)) {
                    continue
                }

                const children = await loadDirectoryContents(fullPath)
                files.push({
                    name: item,
                    path: fullPath,
                    type: getFileType(item, true),
                    isDirectory: true,
                    children: children
                })
            } else {
                files.push({
                    name: item,
                    path: fullPath,
                    type: getFileType(item, false),
                    isDirectory: false
                })
            }
        }

        return files.sort((a, b) => {
            // Directories first, then files
            if (a.isDirectory && !b.isDirectory) return -1
            if (!a.isDirectory && b.isDirectory) return 1
            return a.name.localeCompare(b.name)
        })
    }

    const loadDirectoryContents = async (dirPath: string): Promise<ProjectFile[]> => {
        try {
            const result = await window.electronAPI.fs.readDirectory(dirPath)
            if (result.success && result.data) {
                return parseProjectStructure(result.data, dirPath)
            }
        } catch (error) {
            console.error(`Failed to load directory ${dirPath}:`, error)
        }
        return []
    }

    const isDirectory = async (path: string): Promise<boolean> => {
        try {
            const result = await window.electronAPI.fs.getFileStats(path)
            return result.success && result.data?.isDirectory
        } catch (error) {
            return false
        }
    }

    const getFileType = (name: string, isDirectory: boolean): ProjectFile['type'] => {
        if (isDirectory) {
            if (name === 'app') return 'page'
            if (name === 'components') return 'component'
            if (name === 'lib') return 'other'
            return 'other'
        }

        if (name.endsWith('.tsx') || name.endsWith('.jsx')) {
            if (name === 'page.tsx' || name === 'page.jsx') return 'page'
            if (name === 'layout.tsx' || name === 'layout.jsx') return 'layout'
            return 'component'
        }

        return 'other'
    }

    const toggleFolder = (path: string) => {
        setExpandedFolders(prev => {
            const newSet = new Set(prev)
            if (newSet.has(path)) {
                newSet.delete(path)
            } else {
                newSet.add(path)
            }
            return newSet
        })
    }

    const getFileIcon = (file: ProjectFile) => {
        if (file.isDirectory) {
            return expandedFolders.has(file.path) ? '📂' : '📁'
        }

        switch (file.type) {
            case 'page':
                return '📄'
            case 'component':
                return '🧩'
            case 'layout':
                return '🏗️'
            default:
                return '📄'
        }
    }

    const renderFile = (file: ProjectFile, depth = 0) => {
        const isExpanded = expandedFolders.has(file.path)
        const isSelected = selectedFile?.path === file.path

        return (
            <div key={file.path}>
                <div
                    className={`flex items-center py-1 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''
                        }`}
                    style={{ paddingLeft: `${depth * 16 + 8}px` }}
                    onClick={() => {
                        if (file.isDirectory) {
                            toggleFolder(file.path)
                        } else {
                            onFileSelect(file)
                        }
                    }}
                >
                    <span className="mr-2 text-sm">
                        {file.isDirectory ? (isExpanded ? '📂' : '📁') : getFileIcon(file)}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                        {file.name}
                    </span>
                </div>

                {file.isDirectory && isExpanded && file.children && (
                    <div>
                        {file.children.map(child => renderFile(child, depth + 1))}
                    </div>
                )}
            </div>
        )
    }

    if (loading) {
        return (
            <div className="p-4">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Project Explorer
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {project?.name || 'No project'}
                </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('pages')}
                    className={`flex-1 px-4 py-2 text-sm font-medium ${activeTab === 'pages'
                            ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                >
                    📄 Pages ({pages.length})
                </button>
                <button
                    onClick={() => setActiveTab('components')}
                    className={`flex-1 px-4 py-2 text-sm font-medium ${activeTab === 'components'
                            ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                >
                    🧩 Components ({components.length})
                </button>
            </div>

            <div className="overflow-y-auto h-full">
                {loading ? (
                    <div className="p-4">
                        <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                    </div>
                ) : (
                    <>
                        {activeTab === 'pages' && (
                            <div className="p-2">
                                {pages.length > 0 ? (
                                    pages.map(page => (
                                        <div
                                            key={page.path}
                                            className={`flex items-center py-2 px-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md ${selectedFile?.path === page.path ? 'bg-blue-100 dark:bg-blue-900' : ''
                                                }`}
                                            onClick={() => onFileSelect(page)}
                                        >
                                            <span className="mr-3 text-lg">📄</span>
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                {page.name}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                        <div className="text-2xl mb-2">📄</div>
                                        <p className="text-sm">No pages found</p>
                                        <p className="text-xs mt-1">Create a page.tsx file in the app directory</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'components' && (
                            <div className="p-2">
                                {components.length > 0 ? (
                                    components.map(component => (
                                        <div
                                            key={component.path}
                                            className={`flex items-center py-2 px-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md ${selectedFile?.path === component.path ? 'bg-blue-100 dark:bg-blue-900' : ''
                                                }`}
                                            onClick={() => onFileSelect(component)}
                                        >
                                            <span className="mr-3 text-lg">🧩</span>
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                {component.name}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                        <div className="text-2xl mb-2">🧩</div>
                                        <p className="text-sm">No components found</p>
                                        <p className="text-xs mt-1">Create components in the components directory</p>
                                        <button
                                            onClick={() => {/* TODO: Implement create component */ }}
                                            className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                        >
                                            Create Component
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
