import { Button } from './Button'

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-16 text-center shadow-soft">
      {Icon ? (
        <div className="mb-4 rounded-2xl bg-brand-50 p-3.5 text-brand-700 ring-1 ring-brand-100">
          <Icon className="h-6 w-6" />
        </div>
      ) : null}
      <h3 className="text-lg font-semibold tracking-tight text-ink">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{description}</p> : null}
      {actionLabel && onAction ? (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
