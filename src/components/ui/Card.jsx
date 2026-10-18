export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-border bg-white shadow-soft ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ title, description, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/80 px-5 py-4 sm:px-6">
      <div>
        <h2 className="text-base font-semibold tracking-tight text-ink">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}
