import { formatDistanceToNow } from 'date-fns'

const ACTION_LABELS = {
  TASK_CREATED: 'created task',
  TASK_UPDATED: 'updated task',
  TASK_DELETED: 'deleted task',
  PROJECT_CREATED: 'created project',
  PROJECT_UPDATED: 'updated project',
  PROJECT_ARCHIVED: 'archived project',
  MEMBER_ADDED: 'added a member',
  MEMBER_REMOVED: 'removed a member',
  COMMENT_ADDED: 'commented on',
}

export default function ActivityFeed({ logs = [] }) {
  if (logs.length === 0) return <p className="text-sm text-muted-foreground py-4 text-center">No activity yet</p>
  return (
    <div className="space-y-3">
      {logs.map(log => (
        <div key={log.id} className="flex gap-3 items-start">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-medium flex-shrink-0">
            {log.user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">
              <span className="font-medium">{log.user?.name}</span>{' '}
              <span className="text-muted-foreground">{ACTION_LABELS[log.action] || log.action}</span>
              {log.metadata?.name || log.metadata?.title ? (
                <span className="font-medium"> "{log.metadata.name || log.metadata.title}"</span>
              ) : null}
            </p>
            <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
