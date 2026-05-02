import { differenceInDays, format, isToday, isTomorrow, isPast } from 'date-fns'

export const getCountdown = (dueDate) => {
  if (!dueDate) return null
  const date = new Date(dueDate)
  const days = differenceInDays(date, new Date())

  if (isPast(date) && !isToday(date)) return { label: `Overdue by ${Math.abs(days)}d`, color: 'red' }
  if (isToday(date)) return { label: 'Due today', color: 'orange' }
  if (isTomorrow(date)) return { label: 'Due tomorrow', color: 'yellow' }
  if (days <= 3) return { label: `${days}d left`, color: 'yellow' }
  return { label: `${days}d left`, color: 'green' }
}

export const formatDate = (date) => date ? format(new Date(date), 'MMM d, yyyy') : '—'
export const isOverdue = (dueDate, status) => dueDate && isPast(new Date(dueDate)) && status !== 'DONE'
