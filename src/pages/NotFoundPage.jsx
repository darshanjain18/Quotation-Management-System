import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-ink">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        The page you requested does not exist or has moved.
      </p>
      <Link to="/" className="mt-6">
        <Button>Go to dashboard</Button>
      </Link>
    </div>
  )
}
