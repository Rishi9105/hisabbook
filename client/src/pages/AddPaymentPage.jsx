import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useApp } from '../context/AppContext'
import { addPayment, getLoan } from '../services/api'
import { PAYMENT_METHODS } from '../constants/loanConstants'
import { ROUTES } from '../constants/routes'
import PageHeader from '../components/shared/PageHeader'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'

export default function AddPaymentPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { labels } = useApp()

  const [loanTitle, setLoanTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    method: PAYMENT_METHODS.CASH,
    note: '',
  })

  useEffect(() => {
    async function fetchLoanTitle() {
      try {
        setLoading(true)
        const res = await getLoan(id)
        if (res.success && res.data) {
          setLoanTitle(res.data.loanTitle || res.data.title || 'Loan')
        }
      } catch (err) {
        toast.error('Failed to load loan details')
      } finally {
        setLoading(false)
      }
    }

    fetchLoanTitle()
  }, [id])

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.amount || !form.date) {
      toast.error('Please enter payment amount and date')
      return
    }

    const amount = Number(form.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Payment amount must be greater than zero')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        amount,
        paymentDate: form.date,
        paymentMethod: form.method,
        note: form.note.trim(),
      }

      const res = await addPayment(id, payload)
      if (res.success) {
        toast.success('Payment recorded successfully!')
        navigate(ROUTES.LOAN_DETAILS(id))
      } else {
        toast.error(res.message || 'Failed to record payment')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to record payment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title={labels.addPayment}
        subtitle={`Payment जोड़ें — ${loading ? '...' : loanTitle}`}
      />

      <Card className="max-w-2xl">
        <div className="mb-6 rounded-xl bg-brand-50 p-4 text-sm text-brand-900 dark:bg-brand-950/40 dark:text-brand-100">
          {labels.paymentInfo}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label={labels.paymentAmount}
            type="number"
            min="1"
            placeholder="3000"
            value={form.amount}
            onChange={updateField('amount')}
            required
          />

          <Input
            label={labels.paymentDate}
            type="date"
            value={form.date}
            onChange={updateField('date')}
            required
          />

          <Select
            label={labels.paymentMethod}
            value={form.method}
            onChange={updateField('method')}
            options={[
              { value: PAYMENT_METHODS.CASH, label: labels.cash },
              { value: PAYMENT_METHODS.UPI, label: labels.upi },
              { value: PAYMENT_METHODS.BANK, label: labels.bankTransfer },
              { value: PAYMENT_METHODS.OTHER, label: labels.other },
            ]}
          />

          <div>
            <label htmlFor="note" className="mb-2 block text-base font-medium text-slate-800 dark:text-slate-100">
              {labels.note}
            </label>
            <textarea
              id="note"
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Optional note about this payment"
              value={form.note}
              onChange={updateField('note')}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? 'Saving...' : labels.savePayment}
            </Button>
            <Button type="button" variant="secondary" size="lg" onClick={() => navigate(ROUTES.LOAN_DETAILS(id))}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
