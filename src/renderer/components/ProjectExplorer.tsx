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
    const [files, setFiles] = useState<ProjectFile[]>([])
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (project?.path) {
            loadProjectStructure()
        }
    }, [project?.path])

    const loadProjectStructure = async () => {
        setLoading(true)
        try {
            // Load the project structure
            const result = await window.electronAPI.fs.readDirectory(project.path)
            if (result.success && result.data) {
                const projectFiles = await parseProjectStructure(result.data, project.path)
                setFiles(projectFiles)

                // Auto-expand important folders
                setExpandedFolders(new Set(['app', 'components', 'lib', 'public']))
            }
        } catch (error) {
            console.error('Failed to load project structure:', error)
        } finally {
            setLoading(false)
        }
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

            <div className="overflow-y-auto h-full">
                {files.map(file => renderFile(file))}
            </div>
        </div>
    )
}
