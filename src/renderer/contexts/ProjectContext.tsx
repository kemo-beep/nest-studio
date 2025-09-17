import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { ProjectInfo } from '@/shared/types'

interface ProjectContextType {
    currentProject: ProjectInfo | null
    projects: ProjectInfo[]
    isLoading: boolean
    error: string | null
    createProject: (options: any) => Promise<void>
    importProject: (projectPath: string) => Promise<void>
    closeProject: () => void
    refreshProject: () => Promise<void>
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

interface ProjectProviderProps {
    children: ReactNode
    currentProject: ProjectInfo | null
    onProjectCreated: (project: ProjectInfo) => void
    onProjectImported: (project: ProjectInfo) => void
    onProjectClosed: () => void
}

export function ProjectProvider({
    children,
    currentProject: initialProject,
    onProjectCreated,
    onProjectImported,
    onProjectClosed
}: ProjectProviderProps) {
    const [currentProject, setCurrentProject] = useState<ProjectInfo | null>(initialProject)
    const [projects, setProjects] = useState<ProjectInfo[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const createProject = useCallback(async (options: any) => {
        console.log('=== PROJECT CONTEXT DEBUG START ===')
        console.log('Creating project with options:', options)
        console.log('window.electronAPI:', window.electronAPI)
        console.log('project.create function:', window.electronAPI?.project?.create)
        
        if (!window.electronAPI?.project?.create) {
            console.error('window.electronAPI.project.create is not available!')
            throw new Error('Electron API not available. Please restart the application.')
        }
        
        setIsLoading(true)
        setError(null)

        try {
            console.log('Calling window.electronAPI.project.create...')
            const response = await window.electronAPI.project.create(options)
            console.log('IPC response:', response)

            if (response.success) {
                const project = response.data
                console.log('Project created successfully:', project)
                setCurrentProject(project)
                setProjects(prev => [...prev, project])
                onProjectCreated(project)
            } else {
                console.error('Project creation failed:', response.error)
                throw new Error(response.error || 'Failed to create project')
            }
        } catch (err) {
            console.error('Error in createProject:', err)
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
            setError(errorMessage)
            throw err
        } finally {
            setIsLoading(false)
        }
        console.log('=== PROJECT CONTEXT DEBUG END ===')
    }, [onProjectCreated])

    const importProject = useCallback(async (projectPath: string) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await window.electronAPI.project.import(projectPath)

            if (response.success) {
                const project = response.data
                setCurrentProject(project)
                setProjects(prev => [...prev, project])
                onProjectImported(project)
            } else {
                throw new Error(response.error || 'Failed to import project')
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
            setError(errorMessage)
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [onProjectImported])

    const closeProject = useCallback(() => {
        setCurrentProject(null)
        onProjectClosed()
    }, [onProjectClosed])

    const refreshProject = useCallback(async () => {
        if (!currentProject) return

        setIsLoading(true)
        setError(null)

        try {
            const response = await window.electronAPI.project.detect(currentProject.path)

            if (response.success) {
                const project = response.data
                setCurrentProject(project)
                setProjects(prev => prev.map(p => p.path === project.path ? project : p))
            } else {
                throw new Error(response.error || 'Failed to refresh project')
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
            setError(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }, [currentProject])

    const value: ProjectContextType = {
        currentProject,
        projects,
        isLoading,
        error,
        createProject,
        importProject,
        closeProject,
        refreshProject
    }

    return (
        <ProjectContext.Provider value={value}>
            {children}
        </ProjectContext.Provider>
    )
}

export function useProject() {
    const context = useContext(ProjectContext)
    if (context === undefined) {
        throw new Error('useProject must be used within a ProjectProvider')
    }
    return context
}
