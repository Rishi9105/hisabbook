import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { ROUTES } from '../constants/routes'
import { getLoans } from '../services/api'
import { formatCurrency } from '../utils/format'
import PageHeader from '../components/shared/PageHeader'
import SummaryCard from '../components/loans/SummaryCard'
import LoanCard from '../components/loans/LoanCard'
import Button from '../components/ui/Button'

export default function DashboardPage() {
  const { user } = useAuth()
  const { labels } = useApp()
  const navigate = useNavigate()

  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchUserLoans() {
      try {
        setLoading(true)
        setError(null)
        // Fetch loans belonging to the authenticated Firebase user
        const res = await getLoans()
        if (res.success && Array.isArray(res.data)) {
          setLoans(res.data)
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch loans from backend')
      } finally {
        setLoading(false)
      }
    }

    fetchUserLoans()
  }, [])

  // Dynamic summary metrics calculated from real fetched loans
  const summary = {
    totalLoans: loans.length,
    activeLoans: loans.filter((l) => (l.calculatedStatus || l.status || 'active') === 'active').length,
    closedLoans: loans.filter((l) => (l.calculatedStatus || l.status) === 'closed').length,
    totalRemaining: loans.reduce(
      (acc, l) => acc + (l.totalOutstanding !== undefined ? l.totalOutstanding : l.remainingBalance !== undefined ? l.remainingBalance : l.loanAmount || l.amount || 0),
      0
    ),
    totalInterestPaid: loans.reduce((acc, l) => acc + (l.interestPaid || 0), 0),
  }

  // Format backend loan objects for frontend rendering
  const formattedLoans = loans.map((l) => ({
    id: l._id || l.id,
    title: l.loanTitle || l.title || 'Untitled Loan',
    type: l.loanType || l.type || 'borrowed',
    status: l.calculatedStatus || l.status || 'active',
    startDate: l.startDate,
    amount: l.loanAmount || l.amount || 0,
    totalPaid: l.totalPaid || 0,
    interestPaid: l.interestPaid || 0,
    remainingBalance: l.totalOutstanding !== undefined ? l.totalOutstanding : l.remainingBalance !== undefined ? l.remainingBalance : l.loanAmount || l.amount || 0,
  }))

  return (
    <div>
      <PageHeader
        title={`${labels.welcomeBack}, ${user?.name ?? 'User'}`}
        subtitle={labels.tagline}
        actions={<Button onClick={() => navigate(ROUTES.CREATE_LOAN)}>{labels.newLoan}</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard title={labels.totalLoans} value={summary.totalLoans} />
        <SummaryCard title={labels.activeLoans} value={summary.activeLoans} accent="amber" />
        <SummaryCard title={labels.closedLoans} value={summary.closedLoans} accent="emerald" />
        <SummaryCard
          title={labels.totalRemaining}
          value={formatCurrency(summary.totalRemaining)}
          accent="brand"
        />
        <SummaryCard
          title={labels.totalInterestPaid}
          value={formatCurrency(summary.totalInterestPaid)}
          accent="slate"
        />
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{labels.recentLoans}</h2>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-500">Loading loans...</div>
        ) : error ? (
          <div className="py-8 text-center text-rose-500">{error}</div>
        ) : formattedLoans.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No loans found. Click "{labels.newLoan}" to create your first loan!
          </div>
        ) : (
          <div className="space-y-4">
            {formattedLoans.map((loan) => (
              <LoanCard key={loan.id} loan={loan} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
