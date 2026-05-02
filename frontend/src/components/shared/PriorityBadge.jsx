import { cn } from '@/lib/utils'

const COLORS = {
  LOW: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  MEDIUM: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  URGENT: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
}

export default function PriorityBadge({ priority, className }) {
  return (
    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', COLORS[priority] || COLORS.MEDIUM, className)}>
      {priority}
    </span>
  )
}
