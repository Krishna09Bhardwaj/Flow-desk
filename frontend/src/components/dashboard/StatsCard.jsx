import { cn } from '@/lib/utils'

export default function StatsCard({ icon, label, value, sub, color = 'primary' }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
    </div>
  )
}
