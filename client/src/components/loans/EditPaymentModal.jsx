import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import { PAYMENT_METHODS } from '../../constants/loanConstants'

export default function EditPaymentModal({ open, onClose, payment, onSave, loading }) {
  const [form, setForm] = useState({
    amount: '',
    date: '',
    method: PAYMENT_METHODS.CASH,
    note: '',
  })

  useEffect(() => {
    if (payment) {
      setForm({
        amount: String(payment.amount || ''),
        date: payment.date || payment.paymentDate ? new Date(payment.date || payment.paymentDate).toISOString().slice(0, 10) : '',
        method: payment.method || payment.paymentMethod || PAYMENT_METHODS.CASH,
        note: payment.note || '',
      })
    }
  }, [payment])

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      amount: Number(form.amount),
      paymentDate: form.date,
      paymentMethod: form.method,
      note: form.note.trim(),
    })
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Payment Record">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Payment Amount (₹)"
          type="number"
          min="1"
          value={form.amount}
          onChange={updateField('amount')}
          required
        />

        <Input
          label="Payment Date"
          type="date"
          value={form.date}
          onChange={updateField('date')}
          required
        />

        <Select
          label="Payment Method"
          value={form.method}
          onChange={updateField('method')}
          options={[
            { value: PAYMENT_METHODS.CASH, label: 'Cash' },
            { value: PAYMENT_METHODS.UPI, label: 'UPI' },
            { value: PAYMENT_METHODS.BANK, label: 'Bank Transfer' },
            { value: PAYMENT_METHODS.OTHER, label: 'Other' },
          ]}
        />

        <div>
          <label htmlFor="edit-payment-note" className="mb-2 block text-base font-medium text-slate-800 dark:text-slate-100">
            Note
          </label>
          <textarea
            id="edit-payment-note"
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            value={form.note}
            onChange={updateField('note')}
          />
        </div>

        <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Update Payment'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
