import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, rgb(15 159 133 / 0.12), transparent 55%), #f3f5f7',
        }}
      />
      <div className="relative rounded-3xl border border-border bg-white px-8 py-10 shadow-lift">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">404</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink">Page not found</h1>
        <p className="mt-2 max-w-md text-sm text-muted">
          The page you requested does not exist or has moved.
        </p>
        <Link to="/" className="mt-6 inline-block">
          <Button>Go to dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
