import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '@/store/auth.store'
import AppShell from '@/components/layout/AppShell'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import DashboardPage from '@/pages/DashboardPage'
import ProjectsPage from '@/pages/ProjectsPage'
import ProjectDetailPage from '@/pages/ProjectDetailPage'
import MyTasksPage from '@/pages/MyTasksPage'
import MembersPage from '@/pages/MembersPage'
import NotificationsPage from '@/pages/NotificationsPage'

const ProtectedRoute = () => {
  const user = useAuthStore(s => s.user)
  return user ? <Outlet /> : <Navigate to="/login" replace />
}

const AdminRoute = () => {
  const user = useAuthStore(s => s.user)
  return user?.role === 'ADMIN' ? <Outlet /> : <Navigate to="/dashboard" replace />
}

const GuestRoute = () => {
  const user = useAuthStore(s => s.user)
  return !user ? <Outlet /> : <Navigate to="/dashboard" replace />
}

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/projects', element: <ProjectsPage /> },
          { path: '/projects/:id', element: <ProjectDetailPage /> },
          { path: '/my-tasks', element: <MyTasksPage /> },
          { path: '/notifications', element: <NotificationsPage /> },
          {
            element: <AdminRoute />,
            children: [
              { path: '/members', element: <MembersPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
])
