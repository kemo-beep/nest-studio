
import { ProjectInfo } from '@/shared/types'
import { useProject } from '../contexts/ProjectContext'

interface ProjectHeaderProps {
    project: ProjectInfo
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
    const { closeProject } = useProject()

    return (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {project.name}
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {project.path}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>Next.js {project.nextjsVersion}</span>
                        {project.typescript && <span>• TypeScript</span>}
                        {project.tailwind && <span>• Tailwind</span>}
                        {project.shadcn && <span>• shadcn/ui</span>}
                    </div>

                    <button
                        onClick={closeProject}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                        title="Close Project"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}
