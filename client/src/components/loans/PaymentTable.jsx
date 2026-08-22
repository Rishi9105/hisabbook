import { useApp } from '../../context/AppContext'
import { formatCurrency, formatDate } from '../../utils/format'

const methodLabels = {
  cash: 'Cash',
  upi: 'UPI',
  bank: 'Bank Transfer',
  other: 'Other',
}

export default function PaymentTable({ payments = [], onEditPayment, onDeletePayment }) {
  const { labels } = useApp()

  if (!payments.length) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
        No payments recorded yet.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-900/50">
          <tr>
            {[
              labels.date,
              labels.payment,
              labels.interest,
              labels.principal,
              labels.remaining,
              labels.paymentMethod,
              'Actions',
            ].map((heading) => (
              <th
                key={heading}
                scope="col"
                className="px-4 py-3 text-left text-sm font-semibold text-slate-600 dark:text-slate-300"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-800">
          {payments.map((payment) => (
            <tr key={payment.id || payment._id}>
              <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700 dark:text-slate-200">
                {formatDate(payment.date || payment.paymentDate)}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                {formatCurrency(payment.amount)}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-sm text-amber-600 dark:text-amber-400 font-medium">
                {formatCurrency(payment.interest || 0)}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                {formatCurrency(payment.principal || payment.amount)}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                {formatCurrency(payment.remaining !== undefined ? payment.remaining : 0)}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700 dark:text-slate-200">
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                  {methodLabels[payment.method || payment.paymentMethod] ?? (payment.method || payment.paymentMethod)}
                </span>
                {payment.note && (
                  <p className="mt-1 max-w-xs truncate text-xs text-slate-500 dark:text-slate-400" title={payment.note}>
                    {payment.note}
                  </p>
                )}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700 dark:text-slate-200">
                <div className="flex items-center gap-2">
                  {onEditPayment && (
                    <button
                      type="button"
                      onClick={() => onEditPayment(payment)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
                      title="Edit Payment"
                    >
                      ✏️
                    </button>
                  )}
                  {onDeletePayment && (
                    <button
                      type="button"
                      onClick={() => onDeletePayment(payment)}
                      className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40"
                      title="Delete Payment"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
