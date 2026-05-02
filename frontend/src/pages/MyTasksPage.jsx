import { useState } from 'react'
import { useMyTasks } from '@/api/tasks.api'
import PriorityBadge from '@/components/shared/PriorityBadge'
import CountdownBadge from '@/components/shared/CountdownBadge'
import TaskDetailModal from '@/components/kanban/TaskDetailModal'
import EmptyState from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/SkeletonLoader'
import { isOverdue } from '@/utils/date.utils'
import { cn } from '@/lib/utils'

const STATUS_LABELS = { TODO: 'To Do', IN_PROGRESS: 'In Progress', IN_REVIEW: 'In Review', DONE: 'Done' }

export default function MyTasksPage() {
  const { data: tasks = [], isLoading } = useMyTasks()
  const [selectedTask, setSelectedTask] = useState(null)

  const grouped = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'].reduce((acc, s) => {
    const items = tasks.filter(t => t.status === s)
    if (items.length > 0) acc[s] = items
    return acc
  }, {})

  if (isLoading) return <TableSkeleton rows={5} />

  if (tasks.length === 0) return (
    <EmptyState icon="✅" title="No tasks assigned to you"
      description="When tasks are assigned to you, they'll appear here." />
  )

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([status, items]) => (
        <div key={status}>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-semibold text-foreground">{STATUS_LABELS[status]}</h3>
            <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{items.length}</span>
          </div>
          <div className="space-y-2">
            {items.map(t => {
              const overdue = isOverdue(t.dueDate, t.status)
              return (
                <button key={t.id} onClick={() => setSelectedTask(t)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 bg-card border rounded-lg text-left hover:border-primary/50 transition-all',
                    overdue ? 'border-red-300 dark:border-red-800' : 'border-border'
                  )}>
                  <PriorityBadge priority={t.priority} />
                  <span className={cn('flex-1 text-sm font-medium text-foreground truncate', overdue && 'text-red-600 dark:text-red-400')}>
                    {t.title}
                  </span>
                  <span className="text-xs text-muted-foreground hidden sm:block">{t.project?.name}</span>
                  {t.dueDate && <CountdownBadge dueDate={t.dueDate} />}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {selectedTask && (
        <TaskDetailModal
          taskId={selectedTask.id}
          projectId={selectedTask.project?.id}
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  )
}
