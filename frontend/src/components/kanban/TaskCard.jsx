import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MessageSquare, Calendar } from 'lucide-react'
import PriorityBadge from '@/components/shared/PriorityBadge'
import CountdownBadge from '@/components/shared/CountdownBadge'
import { isOverdue } from '@/utils/date.utils'
import { cn } from '@/lib/utils'

export default function TaskCard({ task, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  const overdue = isOverdue(task.dueDate, task.status)

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'bg-card border rounded-lg p-3 cursor-pointer hover:border-primary/50 transition-all select-none',
        isDragging ? 'opacity-50 shadow-xl' : 'shadow-sm hover:shadow-md',
        overdue ? 'border-red-300 dark:border-red-800' : 'border-border'
      )}
    >
      <p className={cn('text-sm font-medium text-foreground mb-2 line-clamp-2', overdue && 'text-red-600 dark:text-red-400')}>
        {task.title}
      </p>
      <div className="flex flex-wrap gap-1.5 mb-2">
        <PriorityBadge priority={task.priority} />
        {task.dueDate && <CountdownBadge dueDate={task.dueDate} />}
      </div>
      <div className="flex items-center justify-between mt-1">
        {task.assignee ? (
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-medium">
              {task.assignee.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-xs text-muted-foreground truncate max-w-[80px]">{task.assignee.name}</span>
          </div>
        ) : <span />}
        {task._count?.comments > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MessageSquare size={11} />{task._count.comments}
          </div>
        )}
      </div>
    </div>
  )
}
