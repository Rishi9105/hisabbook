import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatCurrency, formatDate, formatInterestRate } from './format'

export function generateLoanStatementPDF(loan, ledgerData) {
  const doc = new jsPDF()

  const title = loan.loanTitle || loan.title || 'Loan Statement'
  const type = (loan.loanType || loan.type || 'borrowed').toUpperCase()
  const borrowerName = loan.borrowerName || '—'
  const lenderName = loan.lenderName || '—'
  const interestType = loan.interestType || 'monthlyPercentage'
  const interestRate = loan.interestRate || 0
  const status = (loan.status || 'active').toUpperCase()
  const startDate = formatDate(loan.startDate)
  const generatedOn = formatDate(new Date().toISOString())

  // Header Banner / Branding
  doc.setFillColor(15, 23, 42) // Dark slate #0f172a
  doc.rect(0, 0, 210, 32, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text('HisabBook', 14, 18)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Simple & Secure Loan Ledger Statement', 14, 25)

  doc.text(`Generated: ${generatedOn}`, 196, 25, { align: 'right' })

  // Loan Overview Header
  doc.setTextColor(15, 23, 42)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(title, 14, 44)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text(`Direction: ${type}  |  Status: ${status}  |  Start Date: ${startDate}`, 14, 51)

  // Divider line
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.5)
  doc.line(14, 55, 196, 55)

  // Summary Metrics Table
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  doc.text('Loan Summary', 14, 63)

  const summaryRows = [
    [
      { content: 'Borrower:', styles: { fontStyle: 'bold' } },
      borrowerName,
      { content: 'Lender:', styles: { fontStyle: 'bold' } },
      lenderName,
    ],
    [
      { content: 'Original Loan Amount:', styles: { fontStyle: 'bold' } },
      formatCurrency(ledgerData.loanAmount),
      { content: 'Interest Rate:', styles: { fontStyle: 'bold' } },
      formatInterestRate(interestType, interestRate),
    ],
    [
      { content: 'Total Paid:', styles: { fontStyle: 'bold' } },
      formatCurrency(ledgerData.totalPaid),
      { content: 'Accrued Interest:', styles: { fontStyle: 'bold' } },
      formatCurrency(ledgerData.accruedInterest),
    ],
    [
      { content: 'Principal Paid:', styles: { fontStyle: 'bold' } },
      formatCurrency(ledgerData.principalPaid),
      { content: 'Interest Paid:', styles: { fontStyle: 'bold' } },
      formatCurrency(ledgerData.interestPaid),
    ],
    [
      { content: 'Remaining Principal:', styles: { fontStyle: 'bold' } },
      formatCurrency(ledgerData.remainingPrincipal),
      { content: 'Remaining Interest:', styles: { fontStyle: 'bold' } },
      formatCurrency(ledgerData.remainingInterest),
    ],
    [
      { content: 'Total Outstanding:', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
      { content: formatCurrency(ledgerData.totalOutstanding), styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
      { content: 'Status:', styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
      { content: status, styles: { fontStyle: 'bold', fillColor: [241, 245, 249] } },
    ],
  ]

  autoTable(doc, {
    startY: 67,
    body: summaryRows,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 3, textColor: [51, 65, 85] },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 45 },
      2: { cellWidth: 45 },
      3: { cellWidth: 45 },
    },
  })

  const finalSummaryY = doc.lastAutoTable.finalY + 8

  // Payment History Section
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  doc.text('Payment History', 14, finalSummaryY)

  const paymentBreakdown = ledgerData.paymentBreakdown || []

  if (paymentBreakdown.length === 0) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(100, 116, 139)
    doc.text('No payment records logged yet.', 14, finalSummaryY + 8)
  } else {
    const tableHeaders = [
      '#',
      'Date',
      'Amount (INR)',
      'Interest Paid',
      'Principal Paid',
      'Remaining Principal',
      'Method',
      'Note',
    ]

    const tableRows = paymentBreakdown.map((pmt, idx) => [
      idx + 1,
      formatDate(pmt.date),
      formatCurrency(pmt.amount),
      formatCurrency(pmt.interestPaid),
      formatCurrency(pmt.principalPaid),
      formatCurrency(pmt.remainingPrincipalAfter),
      (pmt.paymentMethod || 'cash').toUpperCase(),
      pmt.note || '—',
    ])

    autoTable(doc, {
      startY: finalSummaryY + 4,
      head: [tableHeaders],
      body: tableRows,
      theme: 'striped',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 25 },
        2: { cellWidth: 25, halign: 'right' },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 25, halign: 'right' },
        5: { cellWidth: 25, halign: 'right' },
        6: { cellWidth: 20 },
        7: { cellWidth: 'auto' },
      },
    })
  }

  // Footer Branding
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(148, 163, 184)
    doc.text(
      `HisabBook Statement • Page ${i} of ${pageCount}`,
      105,
      288,
      { align: 'center' }
    )
  }

  // Trigger browser download
  const safeFilename = title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  doc.save(`${safeFilename}_hisabbook_statement.pdf`)
}
