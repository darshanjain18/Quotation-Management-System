import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, FileText, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Dialog } from '../components/ui/Dialog'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'
import { TableSkeleton } from '../components/ui/Skeleton'
import { deriveQuotationStatus } from '../features/quotations/calculations'
import { deleteQuotation, listQuotations } from '../features/quotations/services/quotationsService'
import { formatINR } from '../utils/money'

function formatDate(value) {
  if (!value) return '—'
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function QuotationsPage() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await listQuotations()
      setRows(data)
    } catch (err) {
      setError(err.message || 'Failed to load quotations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let next = rows.map((row) => ({
      ...row,
      status: deriveQuotationStatus(row.quotation_date, row.valid_until),
    }))

    if (q) {
      next = next.filter((row) =>
        [row.quotation_number, row.customer_name, row.company_name, row.email]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(q)),
      )
    }

    if (statusFilter !== 'all') {
      next = next.filter((row) => row.status === statusFilter)
    }

    next.sort((a, b) => {
      if (sortBy === 'amount-desc') return Number(b.total) - Number(a.total)
      if (sortBy === 'amount-asc') return Number(a.total) - Number(b.total)
      if (sortBy === 'customer') return (a.customer_name || '').localeCompare(b.customer_name || '')
      return new Date(b.created_at) - new Date(a.created_at)
    })

    return next
  }, [rows, query, statusFilter, sortBy])

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteQuotation(deleteId)
      toast.success('Quotation deleted')
      setDeleteId(null)
      await load()
    } catch (err) {
      toast.error(err.message || 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Quotations"
        description="Search, filter, and manage saved quotations"
        actions={
          <Button onClick={() => navigate('/quotations/new')}>
            <Plus className="h-4 w-4" />
            Create Quotation
          </Button>
        }
      />

      <Card className="mb-4 p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_160px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by number, customer, or company"
              className="h-11 w-full rounded-xl border border-border bg-white pl-10 pr-3 text-sm shadow-soft transition hover:border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
              aria-label="Search quotations"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 rounded-xl border border-border bg-white px-3 text-sm shadow-soft transition hover:border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="h-11 rounded-xl border border-border bg-white px-3 text-sm shadow-soft transition hover:border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
            aria-label="Sort quotations"
          >
            <option value="newest">Newest first</option>
            <option value="amount-desc">Amount high → low</option>
            <option value="amount-asc">Amount low → high</option>
            <option value="customer">Customer A → Z</option>
          </select>
        </div>
      </Card>

      {loading ? (
        <Card>
          <TableSkeleton />
        </Card>
      ) : error ? (
        <Card className="p-6 text-sm text-danger">{error}</Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={rows.length === 0 ? 'No quotations yet' : 'No matching quotations'}
          description={
            rows.length === 0
              ? 'Create your first quotation to get started.'
              : 'Try a different search or filter.'
          }
          actionLabel={rows.length === 0 ? 'Create Quotation' : undefined}
          onAction={rows.length === 0 ? () => navigate('/quotations/new') : undefined}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table min-w-full text-left text-sm">
              <thead>
                <tr>
                  <th>Quotation</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id}>
                    <td className="font-semibold text-ink">{row.quotation_number}</td>
                    <td>
                      <div className="font-medium text-ink">{row.customer_name}</div>
                      {row.company_name ? <div className="text-xs text-muted">{row.company_name}</div> : null}
                    </td>
                    <td className="text-muted">{formatDate(row.quotation_date)}</td>
                    <td>
                      <Badge tone={row.status === 'expired' ? 'expired' : 'active'}>
                        {row.status === 'expired' ? 'Expired' : 'Active'}
                      </Badge>
                    </td>
                    <td className="text-right font-semibold tabular-nums">{formatINR(row.total)}</td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <Link to={`/quotations/${row.id}`}>
                          <Button variant="ghost" size="sm" aria-label="View">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/quotations/${row.id}/edit`}>
                          <Button variant="ghost" size="sm" aria-label="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label="Delete"
                          onClick={() => setDeleteId(row.id)}
                        >
                          <Trash2 className="h-4 w-4 text-danger" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Dialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        title="Delete quotation?"
        description="This action cannot be undone."
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteId(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </>
        }
      />
    </div>
  )
}
