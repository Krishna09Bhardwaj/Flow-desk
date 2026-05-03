import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useStandupTasks } from '@/api/tasks.api'
import { isToday, isYesterday, isPast } from 'date-fns'
import PriorityBadge from '@/components/shared/PriorityBadge'
import useAuthStore from '@/store/auth.store'

export default function StandupModal({ open, onClose }) {
  const user = useAuthStore(s => s.user)
  const isAdmin = user?.role === 'ADMIN'
  const { data: tasks = [] } = useStandupTasks(isAdmin)

  const overdue = tasks.filter(t => t.dueDate && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate)) && t.status !== 'DONE')
  const dueToday = tasks.filter(t => t.dueDate && isToday(new Date(t.dueDate)) && t.status !== 'DONE')
  const doneYesterday = tasks.filter(t => t.status === 'DONE' && isYesterday(new Date(t.updatedAt)))

  const Section = ({ title, items, emptyMsg, color = '' }) => (
    <div className="mb-5">
      <h4 className={`text-sm font-semibold mb-2 ${color || 'text-foreground'}`}>{title}</h4>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">{emptyMsg}</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map(t => (
            <li key={t.id} className="flex items-center gap-2 text-sm">
              <PriorityBadge priority={t.priority} />
              <span className="text-foreground truncate flex-1">{t.title}</span>
              {isAdmin && t.assignee && (
                <span className="text-xs text-muted-foreground flex-shrink-0">{t.assignee.name}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>📋 Today's Standup</DialogTitle>
        </DialogHeader>
        <div className="text-xs text-muted-foreground mb-4">
          {new Date().toDateString()}{isAdmin && ' · All projects'}
        </div>
        <Section title="⚠️ Overdue" items={overdue} emptyMsg="Nothing overdue 🎉" color="text-red-500 dark:text-red-400" />
        <Section title="📅 Due Today" items={dueToday} emptyMsg="Nothing due today" color="text-orange-500 dark:text-orange-400" />
        <Section title="✅ Completed Yesterday" items={doneYesterday} emptyMsg="Nothing completed yesterday" color="text-green-600 dark:text-green-400" />
      </DialogContent>
    </Dialog>
  )
}
