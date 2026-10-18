const variants = {
  primary:
    'bg-brand-600 text-white shadow-soft hover:bg-brand-700 active:bg-brand-700',
  secondary:
    'bg-white text-ink border border-border shadow-soft hover:border-slate-300 hover:bg-slate-50',
  danger: 'bg-danger text-white shadow-soft hover:bg-rose-700',
  ghost: 'bg-transparent text-muted hover:bg-slate-100/80 hover:text-ink',
}

const sizes = {
  sm: 'h-9 px-3 text-sm rounded-xl',
  md: 'h-10 px-4 text-sm rounded-xl',
  lg: 'h-11 px-5 text-base rounded-xl',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  disabled,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
