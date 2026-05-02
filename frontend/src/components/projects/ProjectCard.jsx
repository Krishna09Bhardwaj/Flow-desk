import { Link } from 'react-router-dom'
import { Users, CheckSquare } from 'lucide-react'
import ProjectHealthBadge from '@/components/dashboard/ProjectHealthBadge'

export default function ProjectCard({ project }) {
  const { id, name, description, color, members, tasks = [], _count, updatedAt } = project
  const taskList = tasks.length > 0 ? tasks : []

  return (
    <Link to={`/projects/${id}`}
      className="block bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color || '#7C3AED' }} />
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">{name}</h3>
        </div>
        <ProjectHealthBadge tasks={taskList} lastActivity={updatedAt} />
      </div>
      {description && <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Users size={12} />{members?.length || 0} members</span>
        <span className="flex items-center gap-1"><CheckSquare size={12} />{_count?.tasks || 0} tasks</span>
      </div>
    </Link>
  )
}
