import { calculateLoanLedger } from '../services/loanCalculation/loanCalculation.service.js'

console.log('==================================================')
console.log('FINANCIAL CALCULATION AUDIT SUITE')
console.log('==================================================\n')

let allPassed = true

function runAuditTest(scenarioCode, title, loan, payments, targetDate, expectations) {
  const result = calculateLoanLedger(loan, payments, targetDate)
  let testPassed = true
  const checks = []

  Object.keys(expectations).forEach((key) => {
    const expected = expectations[key]
    const actual = result[key]
    const match = expected === actual
    if (!match) testPassed = false
    checks.push({ key, expected, actual, match })
  })

  if (!testPassed) allPassed = false

  console.log(`[SCENARIO ${scenarioCode}] ${title}: ${testPassed ? 'PASS' : 'FAIL'}`)
  checks.forEach((c) => {
    console.log(`  - ${c.key}: Expected = ${c.expected}, Actual = ${c.actual} [${c.match ? 'OK' : 'MISMATCH'}]`)
  })
  console.log('')
}

// Scenario A: No payment
runAuditTest(
  'A',
  'No payment on loan with 2% monthly interest',
  { loanAmount: 100000, interestRate: 2, startDate: '2024-01-01', status: 'active' },
  [],
  '2024-01-31',
  {
    loanAmount: 100000,
    totalPaid: 0,
    accruedInterest: 2000,
    interestPaid: 0,
    principalPaid: 0,
    remainingPrincipal: 100000,
    remainingInterest: 2000,
    totalOutstanding: 102000,
  }
)

// Scenario B: One partial payment
runAuditTest(
  'B',
  'One partial payment (₹5,000 on ₹100,000 loan after 30 days @ 2%)',
  { loanAmount: 100000, interestRate: 2, startDate: '2024-01-01', status: 'active' },
  [{ id: 'p1', amount: 5000, paymentDate: '2024-01-31' }],
  '2024-01-31',
  {
    loanAmount: 100000,
    totalPaid: 5000,
    interestPaid: 2000,
    principalPaid: 3000,
    remainingPrincipal: 97000,
    remainingInterest: 0,
    totalOutstanding: 97000,
  }
)

// Scenario C: Multiple irregular payments
runAuditTest(
  'C',
  'Multiple irregular payments across 3 intervals',
  { loanAmount: 50000, interestRate: 2, startDate: '2024-01-01', status: 'active' },
  [
    { id: 'p1', amount: 3000, paymentDate: '2024-01-31' },
    { id: 'p2', amount: 5000, paymentDate: '2024-03-01' },
    { id: 'p3', amount: 2500, paymentDate: '2024-03-31' },
  ],
  '2024-03-31',
  {
    loanAmount: 50000,
    totalPaid: 10500,
    interestPaid: 2839.2,
    principalPaid: 7660.8,
    remainingPrincipal: 42339.2,
    remainingInterest: 0,
    totalOutstanding: 42339.2,
  }
)

// Scenario D: Payment larger than outstanding amount
runAuditTest(
  'D',
  'Overpayment larger than outstanding loan amount',
  { loanAmount: 10000, interestRate: 1, startDate: '2024-01-01', status: 'active' },
  [{ id: 'p1', amount: 15000, paymentDate: '2024-01-31' }],
  '2024-01-31',
  {
    loanAmount: 10000,
    remainingPrincipal: 0,
    remainingInterest: 0,
    totalOutstanding: 0,
    status: 'closed',
  }
)

// Scenario E: Same-day payments
runAuditTest(
  'E',
  'Multiple payments on the exact same date',
  { loanAmount: 50000, interestRate: 2, startDate: '2024-01-01', status: 'active' },
  [
    { id: 'p1', amount: 1000, paymentDate: '2024-01-31' },
    { id: 'p2', amount: 2000, paymentDate: '2024-01-31' },
  ],
  '2024-01-31',
  {
    totalPaid: 3000,
    interestPaid: 1000,
    principalPaid: 2000,
    remainingPrincipal: 48000,
    remainingInterest: 0,
    totalOutstanding: 48000,
  }
)

// Scenario F: Different payment dates across months
runAuditTest(
  'F',
  'Different payment dates across months with exact daily rates',
  { loanAmount: 100000, interestRate: 1.5, startDate: '2024-01-01', status: 'active' },
  [
    { id: 'p1', amount: 10000, paymentDate: '2024-02-15' },
    { id: 'p2', amount: 10000, paymentDate: '2024-04-01' },
  ],
  '2024-04-01',
  {
    totalPaid: 20000,
    remainingPrincipal: 84371.75,
    remainingInterest: 0,
    totalOutstanding: 84371.75,
  }
)

// Scenario G: Zero-interest loan
runAuditTest(
  'G',
  'Zero-interest loan with multiple payments',
  { loanAmount: 50000, interestRate: 0, startDate: '2024-01-01', status: 'active' },
  [
    { id: 'p1', amount: 5000, paymentDate: '2024-01-31' },
    { id: 'p2', amount: 10000, paymentDate: '2024-03-01' },
  ],
  '2024-03-01',
  {
    loanAmount: 50000,
    accruedInterest: 0,
    interestPaid: 0,
    principalPaid: 15000,
    remainingPrincipal: 35000,
    totalOutstanding: 35000,
  }
)

// Scenario H: Borrowed loan
runAuditTest(
  'H',
  'Borrowed direction loan calculation audit',
  { loanAmount: 20000, loanType: 'borrowed', interestRate: 2, startDate: '2024-01-01', status: 'active' },
  [{ id: 'p1', amount: 2400, paymentDate: '2024-01-31' }],
  '2024-01-31',
  {
    loanAmount: 20000,
    totalPaid: 2400,
    interestPaid: 400,
    principalPaid: 2000,
    remainingPrincipal: 18000,
    totalOutstanding: 18000,
  }
)

// Scenario I: Lent loan
runAuditTest(
  'I',
  'Lent direction loan calculation audit',
  { loanAmount: 20000, loanType: 'lent', interestRate: 2, startDate: '2024-01-01', status: 'active' },
  [{ id: 'p1', amount: 2400, paymentDate: '2024-01-31' }],
  '2024-01-31',
  {
    loanAmount: 20000,
    totalPaid: 2400,
    interestPaid: 400,
    principalPaid: 2000,
    remainingPrincipal: 18000,
    totalOutstanding: 18000,
  }
)

// Scenario J: Closed loan
runAuditTest(
  'J',
  'Closed loan calculation audit',
  { loanAmount: 10000, interestRate: 2, startDate: '2024-01-01', status: 'closed' },
  [{ id: 'p1', amount: 10200, paymentDate: '2024-01-31' }],
  '2024-03-01',
  {
    loanAmount: 10000,
    remainingPrincipal: 0,
    remainingInterest: 0,
    totalOutstanding: 0,
    status: 'closed',
  }
)

console.log('==================================================')
console.log(`FINANCIAL AUDIT RESULT: ${allPassed ? 'ALL SCENARIOS PASSED (PASS)' : 'FAILED (FAIL)'}`)
console.log('==================================================')

if (!allPassed) process.exit(1)
