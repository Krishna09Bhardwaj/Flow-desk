import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'
import { useAuthInit } from '@/hooks/useAuth'

function AppLoader() {
  const { loading } = useAuthInit()
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
  return <RouterProvider router={router} />
}

export default AppLoader
