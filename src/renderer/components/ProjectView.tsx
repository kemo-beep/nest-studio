
import { ProjectInfo } from '@/shared/types'
import { NewLayout } from './NewLayout'
import { ProjectHeader } from './ProjectHeader'

interface ProjectViewProps {
    project: ProjectInfo
}

export function ProjectView({ project }: ProjectViewProps) {
    return (
        <div className="h-full flex flex-col">
            <ProjectHeader project={project} />
            <NewLayout project={project} />
        </div>
    )
}
