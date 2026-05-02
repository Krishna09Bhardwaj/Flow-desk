import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, CheckSquare, Users, Bell, X } from 'lucide-react'
import useAuthStore from '@/store/auth.store'
import { useNotifications } from '@/api/notifications.api'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/my-tasks', icon: CheckSquare, label: 'My Tasks' },
  { to: '/notifications', icon: Bell, label: 'Notifications', badge: true },
]

const adminItems = [
  { to: '/members', icon: Users, label: 'Members' },
]

export default function Sidebar({ open, onClose }) {
  const user = useAuthStore(s => s.user)
  const { data: notifications = [] } = useNotifications()
  const unread = notifications.filter(n => !n.isRead).length

  const links = user?.role === 'ADMIN' ? [...navItems, ...adminItems] : navItems

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={onClose} />}
      <aside className={cn(
        'fixed top-0 left-0 h-full w-64 bg-card border-r border-border flex flex-col z-30 transition-transform duration-200',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="flex items-center justify-between px-5 h-16 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-xs">F</span>
            </div>
            <span className="font-semibold text-foreground">FlowDesk</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {links.map(({ to, icon: Icon, label, badge }) => (
            <NavLink key={to} to={to} onClick={onClose}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative',
                isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}>
              <Icon size={18} />
              {label}
              {badge && unread > 0 && (
                <span className="ml-auto bg-primary text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
