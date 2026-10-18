const styles = {
  active: 'bg-emerald-50 text-success border-emerald-200',
  expired: 'bg-amber-50 text-amber-800 border-amber-200',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
}

export function Badge({ children, tone = 'neutral' }) {
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${styles[tone]}`}>
      {children}
    </span>
  )
}
