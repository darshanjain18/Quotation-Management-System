export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200/80 ${className}`} />
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3 p-5">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-11 w-full" />
      ))}
    </div>
  )
}
