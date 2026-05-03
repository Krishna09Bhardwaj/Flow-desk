import useAuthStore from '@/store/auth.store'
import { useAdminDashboard, useMemberDashboard } from '@/api/dashboard.api'
import StatsCard from '@/components/dashboard/StatsCard'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import WorkloadHeatmap from '@/components/dashboard/WorkloadHeatmap'
import { CardSkeleton } from '@/components/shared/SkeletonLoader'
import CountdownBadge from '@/components/shared/CountdownBadge'
import PriorityBadge from '@/components/shared/PriorityBadge'
import { Link } from 'react-router-dom'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const PRIORITY_COLORS = { LOW: '#94a3b8', MEDIUM: '#3b82f6', HIGH: '#f97316', URGENT: '#ef4444' }
const STATUS_COLORS = { TODO: '#94a3b8', IN_PROGRESS: '#3b82f6', IN_REVIEW: '#f59e0b', DONE: '#22c55e' }
const STATUS_LABELS = { TODO: 'To Do', IN_PROGRESS: 'In Progress', IN_REVIEW: 'In Review', DONE: 'Done' }

function AdminDashboard() {
  const { data, isLoading, isError } = useAdminDashboard()

  if (isLoading) return <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}</div>
  if (isError || !data) return (
    <div className="bg-card border border-border rounded-xl p-8 text-center">
      <p className="text-muted-foreground text-sm">Could not load dashboard data. Make sure the backend is running.</p>
    </div>
  )

  const pieData = [
    { name: 'Done', value: data.doneTasks },
    { name: 'Remaining', value: data.totalTasks - data.doneTasks },
  ]
  const statusData = (data.tasksByStatus || []).map(s => ({
    name: STATUS_LABELS[s.status] || s.status,
    count: s._count.id,
    status: s.status,
  }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon="🗂️" label="Total Projects" value={data.totalProjects} />
        <StatsCard icon="✅" label="Total Tasks" value={data.totalTasks} />
        <StatsCard icon="👥" label="Total Members" value={data.totalMembers} />
        <StatsCard icon="⚠️" label="Overdue Tasks" value={data.overdueCount} sub="needs attention" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Task Completion</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                <Cell fill="#7C3AED" />
                <Cell fill="#e2e8f0" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Tasks by Status</h3>
          {statusData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No tasks yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={statusData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {statusData.map((entry, i) => <Cell key={i} fill={STATUS_COLORS[entry.status] || '#7C3AED'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Workload Distribution</h3>
          <WorkloadHeatmap workload={data.workload} />
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
          <ActivityFeed logs={data.recentActivity} />
        </div>
      </div>

      {data.overdueTasks?.length > 0 && (
        <div className="bg-card border border-red-200 dark:border-red-800 rounded-xl p-5">
          <h3 className="font-semibold text-red-600 dark:text-red-400 mb-3">⚠️ Overdue Tasks ({data.overdueCount})</h3>
          <div className="space-y-2">
            {data.overdueTasks.map(t => (
              <div key={t.id} className="flex items-center justify-between text-sm">
                <span className="text-foreground truncate">{t.title}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {t.assignee && <span className="text-xs text-muted-foreground">{t.assignee.name}</span>}
                  <CountdownBadge dueDate={t.dueDate} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MemberDashboard() {
  const { data, isLoading } = useMemberDashboard()
  if (isLoading) return <div className="grid grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}</div>
  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon="📅" label="Due Today" value={data.todayTasks.length} />
        <StatsCard icon="⚠️" label="Overdue" value={data.overdueTasks.length} />
        <StatsCard icon="📈" label="Week Completion" value={`${data.weekCompletionRate}%`} />
        <StatsCard icon="🗂️" label="My Projects" value={data.projects.length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-3">Due Today</h3>
          {data.todayTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">🎉 Nothing due today</p>
          ) : (
            <div className="space-y-2">
              {data.todayTasks.map(t => (
                <div key={t.id} className="flex items-center gap-2 text-sm">
                  <PriorityBadge priority={t.priority} />
                  <span className="text-foreground truncate flex-1">{t.title}</span>
                  <Link to={`/projects/${t.project?.id}`} className="text-xs text-primary hover:underline">{t.project?.name}</Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-3">My Projects</h3>
          {data.projects.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No projects yet</p>
          ) : (
            <div className="space-y-2">
              {data.projects.map(p => (
                <Link key={p.id} to={`/projects/${p.id}`}
                  className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-muted transition-colors">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-foreground font-medium truncate">{p.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{p._count?.tasks} tasks</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const user = useAuthStore(s => s.user)
  return user?.role === 'ADMIN' ? <AdminDashboard /> : <MemberDashboard />
}
