import { Menu, Moon, Sun, LogOut } from 'lucide-react'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useLogout } from '@/api/auth.api'
import { useNotifications } from '@/api/notifications.api'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import useAuthStore from '@/store/auth.store'
import StandupModal from '@/components/shared/StandupModal'
import { useState } from 'react'

export default function TopBar({ onMenuClick, title }) {
  const { dark, toggle } = useDarkMode()
  const { mutate: logout } = useLogout()
  const user = useAuthStore(s => s.user)
  const { data: notifications = [] } = useNotifications()
  const unread = notifications.filter(n => !n.isRead).length
  const [standupOpen, setStandupOpen] = useState(false)

  return (
    <>
      <header className="h-16 border-b border-border bg-card flex items-center px-4 gap-3 sticky top-0 z-10">
        <button onClick={onMenuClick} className="lg:hidden text-muted-foreground hover:text-foreground">
          <Menu size={20} />
        </button>
        <h1 className="text-base font-semibold text-foreground flex-1">{title}</h1>

        <button onClick={() => setStandupOpen(true)}
          className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
          📋 Today's Standup
        </button>

        <button onClick={toggle} className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm hover:bg-primary/30 transition-colors cursor-pointer">
            {user?.name?.[0]?.toUpperCase()}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-sm font-medium text-foreground">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuItem onClick={logout} className="text-red-500 cursor-pointer">
              <LogOut size={14} className="mr-2" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <StandupModal open={standupOpen} onClose={() => setStandupOpen(false)} />
    </>
  )
}
