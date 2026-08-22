import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useApp } from '../context/AppContext'
import { getLoan, updateLoan, deleteLoan, updatePayment, deletePayment } from '../services/api'
import { LOAN_STATUS, LOAN_TYPES } from '../constants/loanConstants'
import { ROUTES } from '../constants/routes'
import { formatCurrency, formatDate, formatInterestRate } from '../utils/format'
import { calculateLoanLedger } from '../utils/ledger'
import { generateLoanStatementPDF } from '../utils/pdfGenerator'
import PageHeader from '../components/shared/PageHeader'
import SummaryCard from '../components/loans/SummaryCard'
import PaymentTable from '../components/loans/PaymentTable'
import StatusBadge from '../components/ui/StatusBadge'
import ProgressBar from '../components/ui/ProgressBar'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import ConfirmationModal from '../components/ui/ConfirmationModal'
import EditLoanModal from '../components/loans/EditLoanModal'
import EditPaymentModal from '../components/loans/EditPaymentModal'

export default function LoanDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { labels } = useApp()

  const [loan, setLoan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modals & confirmation dialog state
  const [showEditLoanModal, setShowEditLoanModal] = useState(false)
  const [editingPayment, setEditingPayment] = useState(null)
  const [deletingPayment, setDeletingPayment] = useState(null)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [showReopenModal, setShowReopenModal] = useState(false)
  const [showDeleteLoanModal, setShowDeleteLoanModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchLoanData = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await getLoan(id)
      if (res.success && res.data) {
        setLoan(res.data)
      } else {
        setError('Loan not found')
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch loan details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLoanData()
  }, [id])

  // Compute live client ledger calculation for complete accuracy
  const ledgerData = useMemo(() => {
    if (!loan) return null
    return calculateLoanLedger(loan, loan.payments || [])
  }, [loan])

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-500 dark:text-slate-400">
        Loading loan details from server...
      </div>
    )
  }

  if (error || !loan || !ledgerData) {
    return (
      <Card>
        <p className="text-lg text-slate-700 dark:text-slate-200">{error || 'Loan not found.'}</p>
        <Button className="mt-4" onClick={() => navigate(ROUTES.DASHBOARD)}>
          Back to Dashboard
        </Button>
      </Card>
    )
  }

  const loanId = loan._id || loan.id
  const title = loan.loanTitle || loan.title || 'Untitled Loan'
  const type = loan.loanType || loan.type || LOAN_TYPES.BORROWED
  const status = loan.status || LOAN_STATUS.ACTIVE
  const interestType = loan.interestType || 'monthlyPercentage'
  const interestRate = loan.interestRate || 0

  const typeLabel = type === LOAN_TYPES.BORROWED ? labels.borrowed : labels.lent
  const statusLabel = status === LOAN_STATUS.CLOSED ? labels.closed : labels.active

  // PDF Generation handler
  const handlePdfDownload = () => {
    try {
      generateLoanStatementPDF(loan, ledgerData)
      toast.success('Loan statement PDF downloaded!')
    } catch (err) {
      console.error('PDF error:', err)
      toast.error('Failed to generate PDF')
    }
  }

  // Loan updates
  const handleSaveLoan = async (updatedFields) => {
    setActionLoading(true)
    try {
      const res = await updateLoan(loanId, updatedFields)
      if (res.success) {
        toast.success('Loan updated successfully!')
        setShowEditLoanModal(false)
        await fetchLoanData()
      } else {
        toast.error(res.message || 'Failed to update loan')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update loan')
    } finally {
      setActionLoading(false)
    }
  }

  // Close Loan handler
  const handleCloseLoan = async () => {
    setActionLoading(true)
    try {
      const res = await updateLoan(loanId, { status: LOAN_STATUS.CLOSED })
      if (res.success) {
        toast.success('Loan closed successfully!')
        setShowCloseModal(false)
        await fetchLoanData()
      } else {
        toast.error(res.message || 'Failed to close loan')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to close loan')
    } finally {
      setActionLoading(false)
    }
  }

  // Reopen Loan handler
  const handleReopenLoan = async () => {
    setActionLoading(true)
    try {
      const res = await updateLoan(loanId, { status: LOAN_STATUS.ACTIVE })
      if (res.success) {
        toast.success('Loan reopened successfully!')
        setShowReopenModal(false)
        await fetchLoanData()
      } else {
        toast.error(res.message || 'Failed to reopen loan')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to reopen loan')
    } finally {
      setActionLoading(false)
    }
  }

  // Delete Loan handler
  const handleDeleteLoan = async () => {
    setActionLoading(true)
    try {
      const res = await deleteLoan(loanId)
      if (res.success) {
        toast.success('Loan deleted successfully')
        setShowDeleteLoanModal(false)
        navigate(ROUTES.DASHBOARD)
      } else {
        toast.error(res.message || 'Failed to delete loan')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete loan')
    } finally {
      setActionLoading(false)
    }
  }

  // Edit Payment handler
  const handleSavePayment = async (updatedFields) => {
    if (!editingPayment) return
    setActionLoading(true)
    try {
      const paymentId = editingPayment.paymentId || editingPayment.id || editingPayment._id
      const res = await updatePayment(paymentId, updatedFields)
      if (res.success) {
        toast.success('Payment updated successfully!')
        setEditingPayment(null)
        await fetchLoanData()
      } else {
        toast.error(res.message || 'Failed to update payment')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update payment')
    } finally {
      setActionLoading(false)
    }
  }

  // Delete Payment handler
  const handleDeletePayment = async () => {
    if (!deletingPayment) return
    setActionLoading(true)
    try {
      const paymentId = deletingPayment.paymentId || deletingPayment.id || deletingPayment._id
      const res = await deletePayment(paymentId)
      if (res.success) {
        toast.success('Payment record deleted')
        setDeletingPayment(null)
        await fetchLoanData()
      } else {
        toast.error(res.message || 'Failed to delete payment')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete payment')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={`${labels.startDate}: ${formatDate(loan.startDate)} • ${formatInterestRate(interestType, interestRate)}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => navigate(ROUTES.ADD_PAYMENT(loanId))}>
              {labels.addPayment}
            </Button>
            <Button variant="secondary" onClick={handlePdfDownload}>
              📄 {labels.downloadPdf}
            </Button>
            <Button variant="ghost" onClick={() => setShowEditLoanModal(true)}>
              ✏️ {labels.editLoan}
            </Button>
            {status === LOAN_STATUS.ACTIVE ? (
              <Button variant="ghost" onClick={() => setShowCloseModal(true)}>
                🔒 Close Loan
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => setShowReopenModal(true)}>
                🔓 Reopen Loan
              </Button>
            )}
            <Button variant="danger" onClick={() => setShowDeleteLoanModal(true)}>
              🗑️ Delete
            </Button>
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <StatusBadge type={type} label={typeLabel} />
        <StatusBadge type={status} label={statusLabel} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title={labels.loanAmount} value={formatCurrency(ledgerData.loanAmount)} />
        <SummaryCard title={labels.totalPaid} value={formatCurrency(ledgerData.totalPaid)} accent="emerald" />
        <SummaryCard title={labels.interestPaid} value={formatCurrency(ledgerData.interestPaid)} accent="amber" />
        <SummaryCard title={labels.principalPaid} value={formatCurrency(ledgerData.principalPaid)} />
        <SummaryCard title="Accrued Interest" value={formatCurrency(ledgerData.accruedInterest)} accent="slate" />
        <SummaryCard title="Remaining Principal" value={formatCurrency(ledgerData.remainingPrincipal)} />
        <SummaryCard title="Remaining Interest" value={formatCurrency(ledgerData.remainingInterest)} accent="amber" />
        <SummaryCard
          title={labels.remainingBalance}
          value={formatCurrency(ledgerData.totalOutstanding)}
          accent="brand"
        />
      </div>

      <Card className="mt-6">
        <ProgressBar
          label="Principal repaid"
          value={ledgerData.principalPaid}
          max={ledgerData.loanAmount}
        />
      </Card>

      <Card className="mt-6">
        <div className="mb-4 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-slate-500">{labels.borrowerName}</p>
            <p className="font-medium text-slate-900 dark:text-white">{loan.borrowerName}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">{labels.lenderName}</p>
            <p className="font-medium text-slate-900 dark:text-white">{loan.lenderName}</p>
          </div>
          {loan.phoneNumber && (
            <div>
              <p className="text-sm text-slate-500">{labels.phoneNumber}</p>
              <p className="font-medium text-slate-900 dark:text-white">{loan.phoneNumber}</p>
            </div>
          )}
        </div>
        {loan.notes && (
          <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900/50 dark:text-slate-300">
            {loan.notes}
          </p>
        )}
      </Card>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">{labels.paymentHistory}</h2>
        <PaymentTable
          payments={ledgerData.paymentBreakdown}
          onEditPayment={(pmt) => setEditingPayment(pmt)}
          onDeletePayment={(pmt) => setDeletingPayment(pmt)}
        />
      </section>

      {/* Edit Loan Modal */}
      <EditLoanModal
        open={showEditLoanModal}
        onClose={() => setShowEditLoanModal(false)}
        loan={loan}
        onSave={handleSaveLoan}
        loading={actionLoading}
      />

      {/* Edit Payment Modal */}
      <EditPaymentModal
        open={Boolean(editingPayment)}
        onClose={() => setEditingPayment(null)}
        payment={editingPayment}
        onSave={handleSavePayment}
        loading={actionLoading}
      />

      {/* Delete Payment Confirmation Modal */}
      <ConfirmationModal
        open={Boolean(deletingPayment)}
        onClose={() => setDeletingPayment(null)}
        onConfirm={handleDeletePayment}
        title="Delete Payment Record?"
        message="Are you sure you want to delete this payment record? Ledger balance will be automatically recalculated."
        confirmText="Delete Payment"
        variant="danger"
        loading={actionLoading}
      />

      {/* Close Loan Confirmation Modal */}
      <ConfirmationModal
        open={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        onConfirm={handleCloseLoan}
        title="Close Loan?"
        message="Are you sure you want to mark this loan as closed?"
        confirmText="Close Loan"
        variant="primary"
        loading={actionLoading}
      />

      {/* Reopen Loan Confirmation Modal */}
      <ConfirmationModal
        open={showReopenModal}
        onClose={() => setShowReopenModal(false)}
        onConfirm={handleReopenLoan}
        title="Reopen Loan?"
        message="Are you sure you want to reopen this loan?"
        confirmText="Reopen Loan"
        variant="primary"
        loading={actionLoading}
      />

      {/* Delete Loan Confirmation Modal */}
      <ConfirmationModal
        open={showDeleteLoanModal}
        onClose={() => setShowDeleteLoanModal(false)}
        onConfirm={handleDeleteLoan}
        title="Delete Entire Loan?"
        message="Are you sure you want to delete this loan and all associated payment records? This action cannot be undone."
        confirmText="Delete Loan"
        variant="danger"
        loading={actionLoading}
      />
    </div>
  )
}
