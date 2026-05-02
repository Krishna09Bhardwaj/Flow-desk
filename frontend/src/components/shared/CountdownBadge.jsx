import { getCountdown } from '@/utils/date.utils'
import { cn } from '@/lib/utils'

const COLOR_MAP = {
  green: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
}

export default function CountdownBadge({ dueDate, className }) {
  const countdown = getCountdown(dueDate)
  if (!countdown) return null
  return (
    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', COLOR_MAP[countdown.color], className)}>
      {countdown.label}
    </span>
  )
}
