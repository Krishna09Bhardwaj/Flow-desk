import { useState, useCallback } from 'react'
import { useMyTasks } from '@/api/tasks.api'
import PriorityBadge from '@/components/shared/PriorityBadge'
import CountdownBadge from '@/components/shared/CountdownBadge'
import TaskDetailModal from '@/components/kanban/TaskDetailModal'
import EmptyState from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/SkeletonLoader'
import { isOverdue } from '@/utils/date.utils'
import { cn } from '@/lib/utils'
import { ChevronDown, NotebookPen } from 'lucide-react'

const STATUS_LABELS = { TODO: 'To Do', IN_PROGRESS: 'In Progress', IN_REVIEW: 'In Review', DONE: 'Done' }

const NOTES_KEY = (taskId) => `task-notes-${taskId}`

function TaskRow({ t, onOpenModal }) {
  const overdue = isOverdue(t.dueDate, t.status)
  const [notesOpen, setNotesOpen] = useState(false)
  const [note, setNote] = useState(() => localStorage.getItem(NOTES_KEY(t.id)) ?? '')

  const handleNoteChange = useCallback((e) => {
    const val = e.target.value
    setNote(val)
    localStorage.setItem(NOTES_KEY(t.id), val)
  }, [t.id])

  const toggleNotes = (e) => {
    e.stopPropagation()
    setNotesOpen(o => !o)
  }

  return (
    <div className={cn(
      'bg-card border rounded-lg overflow-hidden transition-all',
      overdue ? 'border-red-300 dark:border-red-800' : 'border-border'
    )}>
      {/* Main task row */}
      <div className="flex items-center gap-3 p-3">
        {/* Clickable area → opens modal */}
        <button
          onClick={() => onOpenModal(t)}
          className="flex flex-1 items-center gap-3 text-left min-w-0 hover:opacity-80 transition-opacity"
        >
          <PriorityBadge priority={t.priority} />
          <span className={cn('flex-1 text-sm font-medium text-foreground truncate', overdue && 'text-red-600 dark:text-red-400')}>
            {t.title}
          </span>
          <span className="text-xs text-muted-foreground hidden sm:block shrink-0">{t.project?.name}</span>
          {t.dueDate && <CountdownBadge dueDate={t.dueDate} />}
        </button>

        {/* Notes toggle */}
        <button
          onClick={toggleNotes}
          title={notesOpen ? 'Hide notes' : 'Show notes'}
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all shrink-0 ml-2',
            notesOpen
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          <NotebookPen size={13} />
          <span className="hidden sm:inline">Notes</span>
          <ChevronDown size={13} className={cn('transition-transform duration-200', notesOpen && 'rotate-180')} />
        </button>
      </div>

      {/* Collapsible notes area */}
      {notesOpen && (
        <div className="px-3 pb-3 border-t border-border/50">
          <textarea
            value={note}
            onChange={handleNoteChange}
            placeholder="Write your personal notes for this task…"
            rows={3}
            className={cn(
              'w-full mt-2 resize-y text-sm bg-muted/50 border border-border rounded-md px-3 py-2',
              'text-foreground placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60',
              'transition-colors'
            )}
          />
          {note && (
            <p className="text-[11px] text-muted-foreground mt-1">Saved locally on this device</p>
          )}
        </div>
      )}
    </div>
  )
}

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
            {items.map(t => (
              <TaskRow key={t.id} t={t} onOpenModal={setSelectedTask} />
            ))}
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
