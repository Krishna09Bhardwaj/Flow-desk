import { cn } from '@/lib/utils'

const getColor = (count) => {
  if (count === 0) return 'bg-muted text-muted-foreground'
  if (count <= 3) return 'bg-green-500'
  if (count <= 6) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getWidth = (count, max) => max === 0 ? '0%' : `${Math.min((count / max) * 100, 100)}%`

export default function WorkloadHeatmap({ workload = [] }) {
  const max = Math.max(...workload.map(m => m.openTasks), 1)
  if (workload.length === 0) return <p className="text-sm text-muted-foreground py-4 text-center">No members</p>

  return (
    <div className="space-y-2.5">
      {workload.map(m => (
        <div key={m.id} className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-medium flex-shrink-0">
            {m.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-foreground truncate">{m.name}</span>
              <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">{m.openTasks} open</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className={cn('h-full rounded-full transition-all', getColor(m.openTasks))}
                style={{ width: getWidth(m.openTasks, max) }} />
            </div>
          </div>
        </div>
      ))}
      <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />1–3</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />4–6</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />7+</span>
      </div>
    </div>
  )
}
