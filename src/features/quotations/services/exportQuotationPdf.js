import { formatINR } from '../../../utils/money'

function formatDate(value) {
  if (!value) return '—'
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function getQuotationPdfFilename(quotation) {
  const number = String(quotation?.quotation_number || 'quotation')
    .replace(/[^\w.-]+/g, '_')
    .replace(/_+/g, '_')
  return `${number}.pdf`
}

function drawSectionLabel(doc, text, x, y) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text(String(text).toUpperCase(), x, y)
}

/**
 * Generate and download a professional quotation PDF matching the on-screen document.
 */
export async function exportQuotationPdf(quotation) {
  if (!quotation) throw new Error('Quotation is required')

  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])
  const autoTable = autoTableModule.default

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const marginX = 40
  const contentWidth = pageWidth - marginX * 2
  let y = 44

  // Header bar
  doc.setFillColor(15, 159, 133)
  doc.rect(0, 0, pageWidth, 8, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(17, 24, 39)
  doc.text('QMS', marginX, y + 10)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(107, 114, 128)
  doc.text('Software Quotation', marginX, y + 26)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(17, 24, 39)
  doc.text(String(quotation.quotation_number || ''), pageWidth - marginX, y + 10, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(107, 114, 128)
  doc.text(`Issued ${formatDate(quotation.quotation_date)}`, pageWidth - marginX, y + 26, {
    align: 'right',
  })

  y = 92
  doc.setDrawColor(229, 231, 235)
  doc.setLineWidth(1)
  doc.line(marginX, y, pageWidth - marginX, y)

  // Customer + details columns
  y = 114
  const leftCol = marginX
  const rightCol = pageWidth / 2 + 12

  drawSectionLabel(doc, 'Customer Details', leftCol, y)
  drawSectionLabel(doc, 'Quotation Details', rightCol, y)

  y += 18
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(17, 24, 39)
  doc.text(String(quotation.customer_name || '—'), leftCol, y)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(55, 65, 81)

  const customerLines = [quotation.company_name, quotation.email, quotation.phone].filter(Boolean)
  customerLines.forEach((line, index) => {
    doc.text(String(line), leftCol, y + 16 + index * 14)
  })

  const detailRows = [
    ['Quotation Number', quotation.quotation_number || '—'],
    ['Quotation Date', formatDate(quotation.quotation_date)],
    ['Valid Until', formatDate(quotation.valid_until)],
    ['GST Rate', `${Number(quotation.gst_rate)}%`],
  ]

  detailRows.forEach(([label, value], index) => {
    const rowY = y + index * 16
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(107, 114, 128)
    doc.text(label, rightCol, rowY)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(17, 24, 39)
    doc.text(String(value), pageWidth - marginX, rowY, { align: 'right' })
  })

  const customerBlockHeight = Math.max(customerLines.length * 14 + 20, detailRows.length * 16)
  y += customerBlockHeight + 18

  doc.setDrawColor(229, 231, 235)
  doc.line(marginX, y, pageWidth - marginX, y)
  y += 22

  drawSectionLabel(doc, 'Products / Services', marginX, y)
  y += 10

  const items = quotation.quotation_items || []
  autoTable(doc, {
    startY: y,
    head: [['Product / Service', 'Qty', 'Unit Price', 'Discount', 'Amount']],
    body: items.map((item) => [
      item.product_name || '',
      String(Number(item.quantity)),
      formatINR(item.unit_price),
      `${Number(item.discount)}%`,
      formatINR(item.amount),
    ]),
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: { top: 8, right: 8, bottom: 8, left: 8 },
      textColor: [17, 24, 39],
      lineColor: [229, 231, 235],
      lineWidth: 0.5,
      valign: 'middle',
    },
    headStyles: {
      fillColor: [15, 159, 133],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: contentWidth * 0.38, halign: 'left' },
      1: { cellWidth: contentWidth * 0.12, halign: 'right' },
      2: { cellWidth: contentWidth * 0.18, halign: 'right' },
      3: { cellWidth: contentWidth * 0.14, halign: 'right' },
      4: { cellWidth: contentWidth * 0.18, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: marginX, right: marginX },
    tableWidth: contentWidth,
  })

  const totalsStartY = (doc.lastAutoTable?.finalY || y) + 24
  const totalsWidth = 220
  const totalsX = pageWidth - marginX - totalsWidth

  doc.setDrawColor(229, 231, 235)
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(totalsX - 12, totalsStartY - 14, totalsWidth + 24, 86, 6, 6, 'FD')

  const totals = [
    ['Subtotal', formatINR(quotation.subtotal), false],
    [`GST (${Number(quotation.gst_rate)}%)`, formatINR(quotation.gst), false],
    ['Grand Total', formatINR(quotation.total), true],
  ]

  totals.forEach(([label, value, emphasize], index) => {
    const rowY = totalsStartY + index * 22
    doc.setFont('helvetica', emphasize ? 'bold' : 'normal')
    doc.setFontSize(emphasize ? 12 : 10)
    doc.setTextColor(emphasize ? 17 : 107, emphasize ? 24 : 114, emphasize ? 39 : 128)
    doc.text(label, totalsX, rowY)
    doc.setTextColor(17, 24, 39)
    if (emphasize) doc.setTextColor(11, 111, 93)
    doc.text(value, pageWidth - marginX, rowY, { align: 'right' })
  })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(156, 163, 175)
  doc.text('Generated by QMS — Quotation Management System', marginX, pageHeight - 28)

  doc.save(getQuotationPdfFilename(quotation))
}
