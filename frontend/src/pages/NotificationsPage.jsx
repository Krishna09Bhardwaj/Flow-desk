import { useNotifications, useMarkOneRead, useMarkAllRead } from '@/api/notifications.api'
import { Button } from '@/components/ui/button'
import EmptyState from '@/components/shared/EmptyState'
import { TableSkeleton } from '@/components/shared/SkeletonLoader'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

const TYPE_ICONS = {
  TASK_ASSIGNED: '📋',
  COMMENT_ADDED: '💬',
  PROJECT_ADDED: '🗂️',
}

export default function NotificationsPage() {
  const { data: notifications = [], isLoading } = useNotifications()
  const { mutate: markOne } = useMarkOneRead()
  const { mutate: markAll } = useMarkAllRead()
  const unread = notifications.filter(n => !n.isRead).length

  if (isLoading) return <TableSkeleton rows={5} />

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{unread} unread</p>
        {unread > 0 && <Button variant="outline" size="sm" onClick={() => markAll()}>Mark all as read</Button>}
      </div>
      {notifications.length === 0 ? (
        <EmptyState icon="🔔" title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.id} onClick={() => !n.isRead && markOne(n.id)}
              className={cn(
                'flex items-start gap-3 p-4 bg-card border rounded-lg transition-colors cursor-pointer',
                n.isRead ? 'border-border opacity-60' : 'border-primary/30 hover:border-primary/50'
              )}>
              <span className="text-xl flex-shrink-0">{TYPE_ICONS[n.type] || '🔔'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
              </div>
              {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
