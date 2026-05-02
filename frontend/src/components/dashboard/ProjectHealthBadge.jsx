import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { calcHealthScore } from '@/utils/health-score'
import { cn } from '@/lib/utils'

const COLORS = {
  Healthy: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  'At Risk': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  Critical: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
}

export default function ProjectHealthBadge({ tasks, lastActivity }) {
  const health = calcHealthScore(tasks, lastActivity)
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full cursor-help', COLORS[health.score])}>
            {health.score}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-xs">{health.tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
