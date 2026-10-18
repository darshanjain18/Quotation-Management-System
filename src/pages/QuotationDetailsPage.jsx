import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, FileDown, Pencil, Printer, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../components/ui/Button'
import { Dialog } from '../components/ui/Dialog'
import { PageHeader } from '../components/ui/PageHeader'
import { Skeleton } from '../components/ui/Skeleton'
import { QuotationDocument } from '../features/quotations/components/QuotationDocument'
import { exportQuotationPdf } from '../features/quotations/services/exportQuotationPdf'
import { deleteQuotation, getQuotation } from '../features/quotations/services/quotationsService'

export function QuotationDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quotation, setQuotation] = useState(null)
  const [error, setError] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const data = await getQuotation(id)
        if (!active) return
        setQuotation(data)
      } catch (err) {
        if (!active) return
        setError(err.message || 'Failed to load quotation')
      }
    }
    load()
    return () => {
      active = false
    }
  }, [id])

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteQuotation(id)
      toast.success('Quotation deleted')
      navigate('/quotations')
    } catch (err) {
      toast.error(err.message || 'Delete failed')
    } finally {
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  async function handleExportPdf() {
    if (!quotation) return
    setExportingPdf(true)
    try {
      await exportQuotationPdf(quotation)
      toast.success('PDF downloaded')
    } catch (err) {
      toast.error(err.message || 'Failed to export PDF')
    } finally {
      setExportingPdf(false)
    }
  }

  if (error) {
    return (
      <div>
        <p className="text-sm text-danger">{error}</p>
        <Button className="mt-4" variant="secondary" onClick={() => navigate('/quotations')}>
          Back to quotations
        </Button>
      </div>
    )
  }

  if (!quotation) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Quotation Details"
        description="Professional document view"
        actions={
          <div className="no-print flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => navigate('/quotations')}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button variant="secondary" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="secondary" onClick={handleExportPdf} disabled={exportingPdf}>
              <FileDown className="h-4 w-4" />
              {exportingPdf ? 'Exporting…' : 'Download PDF'}
            </Button>
            <Link to={`/quotations/${id}/edit`}>
              <Button variant="secondary">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      <QuotationDocument quotation={quotation} />

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete quotation?"
        description="This permanently removes the quotation and its line items."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)} disabled={deleting}>
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
