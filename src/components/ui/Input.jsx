export function Input({ label, error, id, className = '', ...props }) {
  const inputId = id || props.name
  return (
    <label className="flex flex-col gap-1.5 text-sm" htmlFor={inputId}>
      {label ? <span className="font-medium text-ink">{label}</span> : null}
      <input
        id={inputId}
        className={`h-10 rounded-lg border bg-white px-3 text-ink placeholder:text-slate-400 transition focus:border-brand-500 ${
          error ? 'border-danger' : 'border-border'
        } ${className}`}
        {...props}
      />
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </label>
  )
}
