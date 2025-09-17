import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProjectProvider } from './contexts/ProjectContext'
import { WelcomeScreen } from './components/WelcomeScreen'
import { ProjectView } from './components/ProjectView'
import { LoadingScreen } from './components/LoadingScreen'
import { ErrorBoundary } from './components/ErrorBoundary'
import './App.css'

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
        },
    },
})

function App() {
    const [isLoading, setIsLoading] = useState(true)
    const [currentProject, setCurrentProject] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // Initialize the app
        const initializeApp = async () => {
            try {
                // Check if there's a recent project
                const recentProject = localStorage.getItem('nest-studio-recent-project')
                if (recentProject) {
                    const project = JSON.parse(recentProject)
                    // For now, just set the project without verification
                    // TODO: Add file existence check when fileExists is implemented
                    setCurrentProject(project)
                }
            } catch (err) {
                console.error('Failed to initialize app:', err)
                setError('Failed to initialize application')
            } finally {
                setIsLoading(false)
            }
        }

        initializeApp()
    }, [])

    const handleProjectCreated = (project: any) => {
        setCurrentProject(project)
        localStorage.setItem('nest-studio-recent-project', JSON.stringify(project))
    }

    const handleProjectImported = (project: any) => {
        setCurrentProject(project)
        localStorage.setItem('nest-studio-recent-project', JSON.stringify(project))
    }

    const handleProjectClosed = () => {
        setCurrentProject(null)
        localStorage.removeItem('nest-studio-recent-project')
    }

    if (isLoading) {
        return <LoadingScreen />
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-red-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Reload Application
                    </button>
                </div>
            </div>
        )
    }

    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <ProjectProvider
                    currentProject={currentProject}
                    onProjectCreated={handleProjectCreated}
                    onProjectImported={handleProjectImported}
                    onProjectClosed={handleProjectClosed}
                >
                    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
                        {currentProject ? (
                            <ProjectView project={currentProject} />
                        ) : (
                            <WelcomeScreen />
                        )}
                    </div>
                </ProjectProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    )
}

export default App
