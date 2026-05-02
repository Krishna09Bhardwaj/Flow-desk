import { useMembers } from '@/api/members.api'
import { Badge } from '@/components/ui/badge'
import { TableSkeleton } from '@/components/shared/SkeletonLoader'
import EmptyState from '@/components/shared/EmptyState'
import { formatDate } from '@/utils/date.utils'

export default function MembersPage() {
  const { data: members = [], isLoading } = useMembers()
  if (isLoading) return <TableSkeleton rows={5} />
  if (members.length === 0) return <EmptyState icon="👥" title="No members yet" />

  return (
    <div className="space-y-2">
      {members.map(m => (
        <div key={m.id} className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
            {m.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{m.name}</p>
            <p className="text-xs text-muted-foreground">{m.email}</p>
          </div>
          <Badge variant={m.role === 'ADMIN' ? 'default' : 'secondary'} className={m.role === 'ADMIN' ? 'bg-primary' : ''}>
            {m.role}
          </Badge>
          <span className="text-xs text-muted-foreground hidden sm:block">Joined {formatDate(m.createdAt)}</span>
        </div>
      ))}
    </div>
  )
}
