import { Button } from '@/components/ui/button'

export default function EmptyState({ icon = '📭', title, description, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mb-4 max-w-xs">{description}</p>}
      {action && onAction && (
        <Button onClick={onAction} className="bg-primary hover:bg-primary/90">{action}</Button>
      )}
    </div>
  )
}
