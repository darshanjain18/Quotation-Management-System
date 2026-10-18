import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FileText, IndianRupee, Plus, TriangleAlert } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardHeader } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { Skeleton } from '../components/ui/Skeleton'
import { deriveQuotationStatus } from '../features/quotations/calculations'
import { getDashboardStats } from '../features/quotations/services/quotationsService'
import { formatINR } from '../utils/money'

function formatDate(value) {
  if (!value) return '—'
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function DashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const data = await getDashboardStats()
        if (!active) return
        setStats(data)
      } catch (err) {
        if (!active) return
        setError(err.message || 'Failed to load dashboard')
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Live summary of your quotations"
        actions={
          <Button onClick={() => navigate('/quotations/new')}>
            <Plus className="h-4 w-4" />
            Create Quotation
          </Button>
        }
      />

      {error ? <Card className="mb-4 p-4 text-sm text-danger">{error}</Card> : null}

      {!stats ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <Card className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-brand-50 p-2 text-brand-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted">Total quotations</p>
                  <p className="text-2xl font-semibold tabular-nums">{stats.totalQuotations}</p>
                </div>
              </div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-50 p-2 text-success">
                  <IndianRupee className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted">Total quoted value</p>
                  <p className="text-2xl font-semibold tabular-nums">{formatINR(stats.totalQuotedValue)}</p>
                </div>
              </div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-50 p-2 text-amber-700">
                  <TriangleAlert className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted">Expired quotations</p>
                  <p className="text-2xl font-semibold tabular-nums">{stats.expiredCount}</p>
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader
              title="Recent quotations"
              description="Latest five quotations from your account"
              action={
                <Button variant="secondary" size="sm" onClick={() => navigate('/quotations')}>
                  View all
                </Button>
              }
            />
            {stats.recent.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon={FileText}
                  title="No quotations yet"
                  description="Create a quotation to see activity here."
                  actionLabel="Create Quotation"
                  onAction={() => navigate('/quotations/new')}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-border bg-slate-50 text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th className="px-4 py-3 font-medium">Number</th>
                      <th className="px-4 py-3 font-medium">Customer</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent.map((row) => {
                      const status = deriveQuotationStatus(row.quotation_date, row.valid_until)
                      return (
                        <tr key={row.id} className="border-b border-border/70">
                          <td className="px-4 py-3">
                            <Link className="font-medium text-brand-700 hover:underline" to={`/quotations/${row.id}`}>
                              {row.quotation_number}
                            </Link>
                          </td>
                          <td className="px-4 py-3">{row.customer_name}</td>
                          <td className="px-4 py-3 text-muted">{formatDate(row.quotation_date)}</td>
                          <td className="px-4 py-3">
                            <Badge tone={status === 'expired' ? 'expired' : 'active'}>
                              {status === 'expired' ? 'Expired' : 'Active'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right tabular-nums font-medium">
                            {formatINR(row.total)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
