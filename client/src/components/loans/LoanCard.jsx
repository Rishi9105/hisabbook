import { Link } from 'react-router-dom'
import { LOAN_STATUS, LOAN_TYPES } from '../../constants/loanConstants'
import { ROUTES } from '../../constants/routes'
import { formatCurrency, formatDate } from '../../utils/format'
import { useApp } from '../../context/AppContext'
import Card from '../ui/Card'
import StatusBadge from '../ui/StatusBadge'

export default function LoanCard({ loan }) {
  const { labels } = useApp()

  const typeLabel = loan.type === LOAN_TYPES.BORROWED ? labels.borrowed : labels.lent
  const statusLabel = loan.status === LOAN_STATUS.CLOSED ? labels.closed : labels.active

  return (
    <Link to={ROUTES.LOAN_DETAILS(loan.id)} className="block">
      <Card className="transition-shadow hover:shadow-md">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{loan.title}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {labels.startDate}: {formatDate(loan.startDate)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge type={loan.type} label={typeLabel} />
            <StatusBadge type={loan.status} label={statusLabel} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">{labels.originalAmount}</p>
            <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
              {formatCurrency(loan.amount)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">{labels.paidAmount}</p>
            <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
              {formatCurrency(loan.totalPaid)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">{labels.interestPaid}</p>
            <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
              {formatCurrency(loan.interestPaid)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">{labels.remainingAmount}</p>
            <p className="mt-1 text-base font-semibold text-brand-700 dark:text-brand-300">
              {formatCurrency(loan.remainingBalance)}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  )
}
