import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth'
import { Skeleton } from '../../components/ui/Skeleton'

export function PublicOnlyRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-6">
        <Skeleton className="h-72 w-full max-w-md" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
