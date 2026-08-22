import { LOAN_STATUS } from '../../constants/loanConstants'

const styles = {
  [LOAN_STATUS.ACTIVE]:
    'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900',
  [LOAN_STATUS.CLOSED]:
    'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900',
  borrowed:
    'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-900',
  lent: 'bg-violet-50 text-violet-800 border-violet-200 dark:bg-violet-950/40 dark:text-violet-200 dark:border-violet-900',
}

export default function StatusBadge({ type, label }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${styles[type] ?? styles[LOAN_STATUS.ACTIVE]}`}
    >
      {label}
    </span>
  )
}
