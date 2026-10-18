export function Input({ label, error, id, className = '', ...props }) {
  const inputId = id || props.name
  return (
    <label className="flex flex-col gap-1.5 text-sm" htmlFor={inputId}>
      {label ? <span className="font-medium text-slate-700">{label}</span> : null}
      <input
        id={inputId}
        className={`h-11 rounded-xl border bg-white px-3.5 text-ink placeholder:text-slate-400 shadow-soft transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 ${
          error ? 'border-danger' : 'border-border hover:border-slate-300'
        } ${className}`}
        {...props}
      />
      {error ? <span className="text-xs font-medium text-danger">{error}</span> : null}
    </label>
  )
}
