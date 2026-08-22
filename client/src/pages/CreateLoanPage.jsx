import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { LOAN_TYPES, INTEREST_TYPES } from '../constants/loanConstants'
import { ROUTES } from '../constants/routes'
import { createLoan } from '../services/api'
import PageHeader from '../components/shared/PageHeader'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'

export default function CreateLoanPage() {
  const { labels } = useApp()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    type: LOAN_TYPES.BORROWED,
    borrowerName: '',
    lenderName: '',
    phone: '',
    amount: '',
    interestType: INTEREST_TYPES.MONTHLY_PERCENT,
    interestRate: '',
    startDate: new Date().toISOString().slice(0, 10),
    notes: '',
  })

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.title || !form.amount || !form.interestRate || !form.startDate) {
      toast.error('Please fill required fields')
      return
    }

    setLoading(true)
    try {
      const mappedInterestType =
        form.interestType === INTEREST_TYPES.MONTHLY_PERCENT
          ? 'monthlyPercentage'
          : form.interestType === INTEREST_TYPES.RUPEES_PER_100
          ? 'perHundred'
          : form.interestType

      const payload = {
        loanTitle: form.title,
        loanType: form.type,
        borrowerName: form.borrowerName.trim() || (form.type === LOAN_TYPES.BORROWED ? user?.name || 'Self' : 'Borrower'),
        lenderName: form.lenderName.trim() || (form.type === LOAN_TYPES.BORROWED ? 'Lender' : user?.name || 'Self'),
        phoneNumber: form.phone.trim(),
        loanAmount: Number(form.amount),
        interestType: mappedInterestType,
        interestRate: Number(form.interestRate),
        startDate: form.startDate,
        notes: form.notes.trim(),
      }

      const res = await createLoan(payload)
      if (res.success) {
        toast.success('Loan created successfully!')
        navigate(ROUTES.DASHBOARD)
      } else {
        toast.error(res.message || 'Failed to create loan')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader title={labels.newLoan} subtitle="नया Loan जोड़ें — simple form, clear fields." />

      <Card className="max-w-3xl">
        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          <Input
            className="md:col-span-2"
            label={labels.loanTitle}
            placeholder="e.g. Personal Loan, Shop Loan"
            value={form.title}
            onChange={updateField('title')}
            required
          />

          <Select
            label={labels.loanType}
            value={form.type}
            onChange={updateField('type')}
            options={[
              { value: LOAN_TYPES.BORROWED, label: labels.borrowed },
              { value: LOAN_TYPES.LENT, label: labels.lent },
            ]}
          />

          <Input
            label={labels.loanAmount}
            type="number"
            min="1"
            placeholder="50000"
            value={form.amount}
            onChange={updateField('amount')}
            required
          />

          <Input
            label={labels.borrowerName}
            placeholder="Who borrowed the money?"
            value={form.borrowerName}
            onChange={updateField('borrowerName')}
          />

          <Input
            label={labels.lenderName}
            placeholder="Who lent the money?"
            value={form.lenderName}
            onChange={updateField('lenderName')}
          />

          <Input
            label={labels.phoneNumber}
            type="tel"
            placeholder="9876543210"
            value={form.phone}
            onChange={updateField('phone')}
          />

          <Select
            label={labels.interestType}
            value={form.interestType}
            onChange={updateField('interestType')}
            options={[
              { value: INTEREST_TYPES.MONTHLY_PERCENT, label: labels.monthlyPercent },
              { value: INTEREST_TYPES.RUPEES_PER_100, label: labels.rupeesPer100 },
            ]}
          />

          <Input
            label={labels.interestRate}
            type="number"
            min="0"
            step="0.1"
            placeholder={form.interestType === INTEREST_TYPES.MONTHLY_PERCENT ? '2' : '2'}
            value={form.interestRate}
            onChange={updateField('interestRate')}
            hint={
              form.interestType === INTEREST_TYPES.MONTHLY_PERCENT
                ? 'Example: 2 means 2% per month'
                : 'Example: 2 means ₹2 per ₹100 per month'
            }
            required
          />

          <Input
            label={labels.loanStartDate}
            type="date"
            value={form.startDate}
            onChange={updateField('startDate')}
            required
          />

          <div className="md:col-span-2">
            <label htmlFor="notes" className="mb-2 block text-base font-medium text-slate-800 dark:text-slate-100">
              {labels.notes}
            </label>
            <textarea
              id="notes"
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Any extra details..."
              value={form.notes}
              onChange={updateField('notes')}
            />
          </div>

          <div className="md:col-span-2">
            <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto">
              {loading ? 'Creating...' : labels.createLoan}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
