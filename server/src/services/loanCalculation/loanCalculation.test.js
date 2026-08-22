import assert from 'node:assert'
import { calculateLoanLedger } from './loanCalculation.service.js'

console.log('Running Loan Calculation Engine Unit Tests...')

// Test Case 1: Zero interest loan with irregular payments
{
  const loan = {
    loanAmount: 50000,
    interestRate: 0,
    startDate: '2024-01-01',
    status: 'active',
  }
  const payments = [
    { id: 'p1', amount: 3000, paymentDate: '2024-02-01' },
    { id: 'p2', amount: 5000, paymentDate: '2024-03-01' },
    { id: 'p3', amount: 2500, paymentDate: '2024-04-01' },
    { id: 'p4', amount: 7000, paymentDate: '2024-05-01' },
  ]

  const result = calculateLoanLedger(loan, payments, new Date('2024-06-01'))
  assert.strictEqual(result.loanAmount, 50000)
  assert.strictEqual(result.totalPaid, 17500)
  assert.strictEqual(result.accruedInterest, 0)
  assert.strictEqual(result.principalPaid, 17500)
  assert.strictEqual(result.interestPaid, 0)
  assert.strictEqual(result.remainingPrincipal, 32500)
  assert.strictEqual(result.totalOutstanding, 32500)
  assert.strictEqual(result.paymentBreakdown.length, 4)
  console.log('✓ Test Case 1 Passed: Zero interest loan with irregular payments')
}

// Test Case 2: Loan with 2% monthly interest and irregular payments
{
  const loan = {
    loanAmount: 50000,
    interestRate: 2, // 2% per month (or ₹2 per 100)
    startDate: '2024-01-01',
    status: 'active',
  }
  const payments = [
    { id: 'p1', amount: 3000, paymentDate: '2024-01-31' }, // 30 days after start date
  ]

  // 30 days @ 2% per 30 days on ₹50,000 = ₹1,000 accrued interest
  // Payment ₹3,000 -> ₹1,000 interest, ₹2,000 principal
  // Remaining principal = ₹48,000
  const result = calculateLoanLedger(loan, payments, new Date('2024-01-31'))
  assert.strictEqual(result.loanAmount, 50000)
  assert.strictEqual(result.totalPaid, 3000)
  assert.strictEqual(result.interestPaid, 1000)
  assert.strictEqual(result.principalPaid, 2000)
  assert.strictEqual(result.remainingPrincipal, 48000)
  assert.strictEqual(result.remainingInterest, 0)
  console.log('✓ Test Case 2 Passed: 2% monthly interest 30-day payment calculation')
}

// Test Case 3: Overpayment closing the loan
{
  const loan = {
    loanAmount: 10000,
    interestRate: 1,
    startDate: '2024-01-01',
    status: 'active',
  }
  const payments = [
    { id: 'p1', amount: 15000, paymentDate: '2024-01-31' },
  ]

  const result = calculateLoanLedger(loan, payments, new Date('2024-01-31'))
  assert.strictEqual(result.remainingPrincipal, 0)
  assert.strictEqual(result.remainingInterest, 0)
  assert.strictEqual(result.totalOutstanding, 0)
  assert.strictEqual(result.status, 'closed')
  console.log('✓ Test Case 3 Passed: Overpayment loan closure')
}

// Test Case 4: Multiple irregular payments on different dates
{
  const loan = {
    loanAmount: 100000,
    interestRate: 2,
    startDate: '2024-01-01',
    status: 'active',
  }
  const payments = [
    { id: 'p1', amount: 10000, paymentDate: '2024-02-01' },
    { id: 'p2', amount: 20000, paymentDate: '2024-03-01' },
    { id: 'p3', amount: 15000, paymentDate: '2024-04-01' },
  ]

  const result = calculateLoanLedger(loan, payments, new Date('2024-04-01'))
  assert.ok(result.totalPaid === 45000)
  assert.ok(result.interestPaid > 0)
  assert.ok(result.principalPaid > 0)
  assert.ok(result.remainingPrincipal < 100000)
  console.log('✓ Test Case 4 Passed: Multiple irregular payments calculation')
}

console.log('All Loan Calculation Engine Unit Tests Passed Successfully!')
