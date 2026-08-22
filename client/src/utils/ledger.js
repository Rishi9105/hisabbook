/**
 * Frontend Loan Ledger Calculation Engine (matches backend loanCalculation.service.js)
 */

function getNormalizedDate(d) {
  const dateObj = new Date(d)
  if (isNaN(dateObj.getTime())) return new Date()
  return new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate()))
}

function getDaysBetween(date1, date2) {
  const d1 = getNormalizedDate(date1)
  const d2 = getNormalizedDate(date2)
  const diffMs = d2.getTime() - d1.getTime()
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)))
}

export function calculateLoanLedger(loan, payments = [], targetDate = new Date()) {
  if (!loan) {
    return {
      loanAmount: 0,
      totalPaid: 0,
      accruedInterest: 0,
      principalPaid: 0,
      interestPaid: 0,
      remainingPrincipal: 0,
      remainingInterest: 0,
      totalOutstanding: 0,
      status: 'active',
      paymentBreakdown: [],
    }
  }

  const originalAmount = Number(loan.loanAmount || loan.amount || 0)
  const interestRate = Number(loan.interestRate || 0)
  const startDate = getNormalizedDate(loan.startDate || Date.now())
  const status = loan.status || 'active'
  const isClosed = status === 'closed'

  // Sort payments chronologically by date
  const sortedPayments = [...payments].sort((a, b) => {
    const dateA = getNormalizedDate(a.paymentDate || a.date || a.createdAt)
    const dateB = getNormalizedDate(b.paymentDate || b.date || b.createdAt)
    return dateA - dateB
  })

  // Zero-interest loan logic
  if (interestRate <= 0) {
    let currentPrincipal = originalAmount
    let totalPaid = 0

    const paymentBreakdown = sortedPayments.map((pmt) => {
      const amt = Number(pmt.amount || 0)
      totalPaid += amt
      const principalPaid = Math.min(amt, currentPrincipal)
      const interestPaid = 0
      currentPrincipal = Math.max(0, currentPrincipal - principalPaid)

      return {
        paymentId: pmt._id || pmt.id,
        date: pmt.paymentDate || pmt.date || pmt.createdAt,
        amount: amt,
        interestPaid: 0,
        principalPaid,
        remainingPrincipalAfter: currentPrincipal,
        remainingInterestAfter: 0,
        paymentMethod: pmt.paymentMethod || pmt.method || 'cash',
        note: pmt.note || '',
      }
    })

    const remainingPrincipal = Math.max(0, originalAmount - totalPaid)
    const totalOutstanding = remainingPrincipal

    return {
      loanAmount: originalAmount,
      totalPaid,
      accruedInterest: 0,
      principalPaid: totalPaid,
      interestPaid: 0,
      remainingPrincipal,
      remainingInterest: 0,
      totalOutstanding,
      status: totalOutstanding <= 0 ? 'closed' : status,
      paymentBreakdown,
    }
  }

  // Simple interest reducing balance engine for irregular payments
  const monthlyRate = interestRate / 100
  const dailyRate = monthlyRate / 30

  let currentPrincipal = originalAmount
  let accumulatedInterest = 0
  let totalInterestPaid = 0
  let totalPrincipalPaid = 0
  let totalPaid = 0
  let totalAccruedInterest = 0
  let lastDate = startDate

  const paymentBreakdown = sortedPayments.map((pmt) => {
    const pmtDate = getNormalizedDate(pmt.paymentDate || pmt.date || pmt.createdAt)
    const daysElapsed = getDaysBetween(lastDate, pmtDate)

    const periodInterest = currentPrincipal * dailyRate * daysElapsed
    accumulatedInterest += periodInterest
    totalAccruedInterest += periodInterest

    const amt = Number(pmt.amount || 0)
    totalPaid += amt

    const interestPaid = Math.min(amt, accumulatedInterest)
    const principalPaid = Math.min(amt - interestPaid, currentPrincipal)

    accumulatedInterest -= interestPaid
    currentPrincipal = Math.max(0, currentPrincipal - principalPaid)

    totalInterestPaid += interestPaid
    totalPrincipalPaid += principalPaid
    lastDate = pmtDate

    return {
      paymentId: pmt._id || pmt.id,
      date: pmt.paymentDate || pmt.date || pmt.createdAt,
      amount: amt,
      interestPaid: Math.round(interestPaid * 100) / 100,
      principalPaid: Math.round(principalPaid * 100) / 100,
      remainingPrincipalAfter: Math.round(currentPrincipal * 100) / 100,
      remainingInterestAfter: Math.round(accumulatedInterest * 100) / 100,
      paymentMethod: pmt.paymentMethod || pmt.method || 'cash',
      note: pmt.note || '',
    }
  })

  const calcEndDate = isClosed && sortedPayments.length > 0
    ? getNormalizedDate(sortedPayments[sortedPayments.length - 1].paymentDate || sortedPayments[sortedPayments.length - 1].date)
    : getNormalizedDate(targetDate)

  if (calcEndDate > lastDate && currentPrincipal > 0) {
    const finalDaysElapsed = getDaysBetween(lastDate, calcEndDate)
    const finalPeriodInterest = currentPrincipal * dailyRate * finalDaysElapsed
    accumulatedInterest += finalPeriodInterest
    totalAccruedInterest += finalPeriodInterest
  }

  const remainingPrincipal = Math.round(currentPrincipal * 100) / 100
  const remainingInterest = Math.round(accumulatedInterest * 100) / 100
  const totalOutstanding = Math.round((remainingPrincipal + remainingInterest) * 100) / 100

  return {
    loanAmount: originalAmount,
    totalPaid: Math.round(totalPaid * 100) / 100,
    accruedInterest: Math.round(totalAccruedInterest * 100) / 100,
    principalPaid: Math.round(totalPrincipalPaid * 100) / 100,
    interestPaid: Math.round(totalInterestPaid * 100) / 100,
    remainingPrincipal,
    remainingInterest,
    totalOutstanding,
    status: totalOutstanding <= 0 ? 'closed' : status,
    paymentBreakdown,
  }
}
