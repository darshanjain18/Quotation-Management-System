import { useEffect, useMemo, useState } from 'react'
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

const SORT_COLUMNS = {
  number: { getValue: (row) => String(row.quotation_number || '').toLowerCase(), type: 'string' },
  customer: { getValue: (row) => String(row.customer_name || '').toLowerCase(), type: 'string' },
  date: { getValue: (row) => row.quotation_date || '', type: 'string' },
  status: {
    getValue: (row) => deriveQuotationStatus(row.quotation_date, row.valid_until),
    type: 'string',
  },
  amount: { getValue: (row) => Number(row.total) || 0, type: 'number' },
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function compareValues(a, b, type) {
  if (type === 'number') return a - b
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
}

export function DashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [sortKey, setSortKey] = useState('date')
  const [sortDir, setSortDir] = useState('desc')

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

  const recentRows = useMemo(() => {
    const rows = stats?.recent ?? []
    const column = SORT_COLUMNS[sortKey]
    if (!column) return rows

    const sorted = [...rows].sort((left, right) => {
      const result = compareValues(column.getValue(left), column.getValue(right), column.type)
      return sortDir === 'asc' ? result : -result
    })
    return sorted
  }, [stats, sortKey, sortDir])

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(key)
    setSortDir(key === 'amount' || key === 'date' ? 'desc' : 'asc')
  }

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
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-brand-50 p-2.5 text-brand-700 ring-1 ring-brand-100">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted">Total quotations</p>
                  <p className="text-2xl font-bold tracking-tight tabular-nums">{stats.totalQuotations}</p>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-slate-100 p-2.5 text-ink ring-1 ring-slate-200">
                  <IndianRupee className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted">Total quoted value</p>
                  <p className="text-2xl font-bold tracking-tight tabular-nums">{formatINR(stats.totalQuotedValue)}</p>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-amber-50 p-2.5 text-amber-700 ring-1 ring-amber-100">
                  <TriangleAlert className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted">Expired quotations</p>
                  <p className="text-2xl font-bold tracking-tight tabular-nums">{stats.expiredCount}</p>
                </div>
              </div>
            </div>
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
                <table className="data-table min-w-full text-left text-sm">
                  <thead>
                    <tr>
                      {[
                        { key: 'number', label: 'Number' },
                        { key: 'customer', label: 'Customer' },
                        { key: 'date', label: 'Date' },
                        { key: 'status', label: 'Status' },
                        { key: 'amount', label: 'Amount', className: 'text-right' },
                      ].map((column) => (
                        <th
                          key={column.key}
                          className={column.className}
                          aria-sort={
                            sortKey === column.key
                              ? sortDir === 'asc'
                                ? 'ascending'
                                : 'descending'
                              : 'none'
                          }
                        >
                          <button
                            type="button"
                            onClick={() => handleSort(column.key)}
                            className={`w-full cursor-pointer select-none bg-transparent p-0 text-inherit font-semibold text-muted transition hover:text-ink ${
                              column.className?.includes('text-right') ? 'text-right' : 'text-left'
                            }`}
                          >
                            {column.label}
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentRows.map((row) => {
                      const status = deriveQuotationStatus(row.quotation_date, row.valid_until)
                      return (
                        <tr key={row.id}>
                          <td>
                            <Link className="font-semibold text-brand-700 hover:underline" to={`/quotations/${row.id}`}>
                              {row.quotation_number}
                            </Link>
                          </td>
                          <td>{row.customer_name}</td>
                          <td className="text-muted">{formatDate(row.quotation_date)}</td>
                          <td>
                            <Badge tone={status === 'expired' ? 'expired' : 'active'}>
                              {status === 'expired' ? 'Expired' : 'Active'}
                            </Badge>
                          </td>
                          <td className="text-right font-semibold tabular-nums">
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
