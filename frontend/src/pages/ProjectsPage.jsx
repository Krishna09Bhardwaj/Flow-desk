import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useProjects } from '@/api/projects.api'
import { Button } from '@/components/ui/button'
import ProjectCard from '@/components/projects/ProjectCard'
import ProjectForm from '@/components/projects/ProjectForm'
import EmptyState from '@/components/shared/EmptyState'
import { CardSkeleton } from '@/components/shared/SkeletonLoader'
import useAuthStore from '@/store/auth.store'

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects()
  const [formOpen, setFormOpen] = useState(false)
  const user = useAuthStore(s => s.user)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Projects</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{projects?.length || 0} total</p>
        </div>
        {user?.role === 'ADMIN' && (
          <Button onClick={() => setFormOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus size={16} className="mr-1.5" /> New Project
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : projects?.length === 0 ? (
        <EmptyState icon="🗂️" title="No projects yet"
          description="Create your first project to get the team started."
          action={user?.role === 'ADMIN' ? 'Create Project' : undefined}
          onAction={user?.role === 'ADMIN' ? () => setFormOpen(true) : undefined} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}

      <ProjectForm open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  )
}
