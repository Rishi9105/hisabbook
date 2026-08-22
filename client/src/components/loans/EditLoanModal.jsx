import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import { LOAN_TYPES, INTEREST_TYPES, LOAN_STATUS } from '../../constants/loanConstants'

export default function EditLoanModal({ open, onClose, loan, onSave, loading }) {
  const [form, setForm] = useState({
    title: '',
    type: LOAN_TYPES.BORROWED,
    borrowerName: '',
    lenderName: '',
    phone: '',
    amount: '',
    interestType: INTEREST_TYPES.MONTHLY_PERCENT,
    interestRate: '',
    startDate: '',
    notes: '',
    status: LOAN_STATUS.ACTIVE,
  })

  useEffect(() => {
    if (loan) {
      const rawInterestType = loan.interestType || 'monthlyPercentage'
      const mappedInterestType =
        rawInterestType === 'monthlyPercentage'
          ? INTEREST_TYPES.MONTHLY_PERCENT
          : rawInterestType === 'perHundred'
          ? INTEREST_TYPES.RUPEES_PER_100
          : rawInterestType

      setForm({
        title: loan.loanTitle || loan.title || '',
        type: loan.loanType || loan.type || LOAN_TYPES.BORROWED,
        borrowerName: loan.borrowerName || '',
        lenderName: loan.lenderName || '',
        phone: loan.phoneNumber || loan.phone || '',
        amount: String(loan.loanAmount || loan.amount || ''),
        interestType: mappedInterestType,
        interestRate: String(loan.interestRate || ''),
        startDate: loan.startDate ? new Date(loan.startDate).toISOString().slice(0, 10) : '',
        notes: loan.notes || '',
        status: loan.status || LOAN_STATUS.ACTIVE,
      })
    }
  }, [loan])

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const mappedInterestType =
      form.interestType === INTEREST_TYPES.MONTHLY_PERCENT
        ? 'monthlyPercentage'
        : form.interestType === INTEREST_TYPES.RUPEES_PER_100
        ? 'perHundred'
        : form.interestType

    onSave({
      loanTitle: form.title,
      loanType: form.type,
      borrowerName: form.borrowerName.trim(),
      lenderName: form.lenderName.trim(),
      phoneNumber: form.phone.trim(),
      loanAmount: Number(form.amount),
      interestType: mappedInterestType,
      interestRate: Number(form.interestRate),
      startDate: form.startDate,
      notes: form.notes.trim(),
      status: form.status,
    })
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Loan Details">
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <Input
          className="md:col-span-2"
          label="Loan Title"
          value={form.title}
          onChange={updateField('title')}
          required
        />

        <Select
          label="Loan Type"
          value={form.type}
          onChange={updateField('type')}
          options={[
            { value: LOAN_TYPES.BORROWED, label: 'I Borrowed Money' },
            { value: LOAN_TYPES.LENT, label: 'I Lent Money' },
          ]}
        />

        <Select
          label="Status"
          value={form.status}
          onChange={updateField('status')}
          options={[
            { value: LOAN_STATUS.ACTIVE, label: 'Active' },
            { value: LOAN_STATUS.CLOSED, label: 'Closed' },
          ]}
        />

        <Input
          label="Borrower Name"
          value={form.borrowerName}
          onChange={updateField('borrowerName')}
          required
        />

        <Input
          label="Lender Name"
          value={form.lenderName}
          onChange={updateField('lenderName')}
          required
        />

        <Input
          label="Phone Number"
          value={form.phone}
          onChange={updateField('phone')}
        />

        <Input
          label="Loan Amount (₹)"
          type="number"
          min="1"
          value={form.amount}
          onChange={updateField('amount')}
          required
        />

        <Select
          label="Interest Type"
          value={form.interestType}
          onChange={updateField('interestType')}
          options={[
            { value: INTEREST_TYPES.MONTHLY_PERCENT, label: 'Monthly %' },
            { value: INTEREST_TYPES.RUPEES_PER_100, label: '₹ per ₹100 / month' },
          ]}
        />

        <Input
          label="Interest Rate"
          type="number"
          min="0"
          step="0.1"
          value={form.interestRate}
          onChange={updateField('interestRate')}
          required
        />

        <Input
          label="Start Date"
          type="date"
          value={form.startDate}
          onChange={updateField('startDate')}
          required
        />

        <div className="md:col-span-2">
          <label htmlFor="edit-notes" className="mb-2 block text-base font-medium text-slate-800 dark:text-slate-100">
            Notes
          </label>
          <textarea
            id="edit-notes"
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            value={form.notes}
            onChange={updateField('notes')}
          />
        </div>

        <div className="mt-4 flex flex-col-reverse justify-end gap-3 sm:flex-row md:col-span-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
