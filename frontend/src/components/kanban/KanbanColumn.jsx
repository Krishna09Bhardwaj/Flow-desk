import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import TaskCard from './TaskCard'
import { TaskCardSkeleton } from '@/components/shared/SkeletonLoader'
import { cn } from '@/lib/utils'

const COLUMN_STYLES = {
  TODO: 'border-t-slate-400',
  IN_PROGRESS: 'border-t-blue-500',
  IN_REVIEW: 'border-t-yellow-500',
  DONE: 'border-t-green-500',
}

const COLUMN_LABELS = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
}

export default function KanbanColumn({ status, tasks, onTaskClick, isLoading }) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div className={cn('flex flex-col rounded-xl bg-muted/40 border-t-4 min-w-[260px] w-[260px] flex-shrink-0', COLUMN_STYLES[status])}>
      <div className="px-4 py-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{COLUMN_LABELS[status]}</h3>
        <span className="text-xs font-medium text-muted-foreground bg-background rounded-full px-2 py-0.5 border border-border">
          {tasks.length}
        </span>
      </div>
      <div ref={setNodeRef} className={cn('flex-1 p-3 space-y-2 min-h-[200px] transition-colors', isOver && 'bg-primary/5 rounded-b-xl')}>
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => <TaskCardSkeleton key={i} />)
        ) : (
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  )
}
