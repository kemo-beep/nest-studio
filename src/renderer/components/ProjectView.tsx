
import { ProjectInfo } from '@/shared/types'
import { Layout } from './Layout'
import { ProjectHeader } from './ProjectHeader'

interface ProjectViewProps {
    project: ProjectInfo
}

export function ProjectView({ project }: ProjectViewProps) {
    return (
        <div className="h-full flex flex-col">
            <ProjectHeader project={project} />
            <Layout project={project} />
        </div>
    )
}
