import { differenceInDays } from 'date-fns'

export const calcHealthScore = (tasks = [], lastActivityDate) => {
  if (tasks.length === 0) return { score: 'Healthy', color: 'green', tooltip: 'No tasks yet' }

  const now = new Date()
  const open = tasks.filter(t => t.status !== 'DONE')
  const overdue = open.filter(t => t.dueDate && new Date(t.dueDate) < now)
  const unassigned = open.filter(t => !t.assigneeId)
  const daysSinceActivity = lastActivityDate ? differenceInDays(now, new Date(lastActivityDate)) : 999

  const overdueRatio = open.length > 0 ? overdue.length / open.length : 0
  const unassignedRatio = open.length > 0 ? unassigned.length / open.length : 0

  let penalty = 0
  if (overdueRatio > 0.3) penalty += 2
  else if (overdueRatio > 0) penalty += 1
  if (unassignedRatio > 0.5) penalty += 1
  if (daysSinceActivity > 7) penalty += 1

  const tooltip = `${Math.round(overdueRatio * 100)}% overdue · ${Math.round(unassignedRatio * 100)}% unassigned · last activity ${daysSinceActivity}d ago`

  if (penalty === 0) return { score: 'Healthy', color: 'green', tooltip }
  if (penalty <= 2) return { score: 'At Risk', color: 'yellow', tooltip }
  return { score: 'Critical', color: 'red', tooltip }
}
