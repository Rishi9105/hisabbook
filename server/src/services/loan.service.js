import Loan from '../models/Loan.js'
import Payment from '../models/Payment.js'
import mongoose from 'mongoose'
import { calculateLoanLedger } from './loanCalculation/loanCalculation.service.js'

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id)
}

export async function createLoan(userId, loanData) {
  if (!isValidObjectId(userId)) {
    throw new Error('INVALID_USER_ID')
  }

  const allowedFields = [
    'loanTitle',
    'loanType',
    'borrowerName',
    'lenderName',
    'phoneNumber',
    'loanAmount',
    'interestType',
    'interestRate',
    'startDate',
    'notes',
    'status',
  ]

  const filteredData = {}
  Object.keys(loanData).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredData[key] = loanData[key]
    }
  })

  const newLoan = await Loan.create({
    ...filteredData,
    userId, // Strictly set from authenticated user ID
  })

  return getLoanById(newLoan._id, userId)
}

export async function getLoans(userId, filters = {}) {
  if (!isValidObjectId(userId)) {
    throw new Error('INVALID_USER_ID')
  }

  const query = { userId }

  if (filters.status) {
    query.status = filters.status
  }

  const loans = await Loan.find(query).sort({ createdAt: -1 })
  
  // Calculate real ledger metrics for each loan
  const decoratedLoans = await Promise.all(
    loans.map(async (loanDoc) => {
      const payments = await Payment.find({ loanId: loanDoc._id }).sort({ paymentDate: 1 })
      const ledger = calculateLoanLedger(loanDoc, payments)
      const loanObj = loanDoc.toObject()

      return {
        ...loanObj,
        totalPaid: ledger.totalPaid,
        accruedInterest: ledger.accruedInterest,
        principalPaid: ledger.principalPaid,
        interestPaid: ledger.interestPaid,
        remainingPrincipal: ledger.remainingPrincipal,
        remainingInterest: ledger.remainingInterest,
        remainingBalance: ledger.totalOutstanding,
        totalOutstanding: ledger.totalOutstanding,
        calculatedStatus: ledger.status,
      }
    })
  )

  return decoratedLoans
}

export async function getLoanById(loanId, userId) {
  if (!isValidObjectId(loanId) || !isValidObjectId(userId)) {
    return null
  }

  // Ensure loan belongs to the authenticated user
  const loanDoc = await Loan.findOne({ _id: loanId, userId })
  if (!loanDoc) return null

  // Fetch associated payment records
  const payments = await Payment.find({ loanId }).sort({ paymentDate: -1, createdAt: -1 })
  const ledger = calculateLoanLedger(loanDoc, payments)

  return {
    ...loanDoc.toObject(),
    totalPaid: ledger.totalPaid,
    accruedInterest: ledger.accruedInterest,
    principalPaid: ledger.principalPaid,
    interestPaid: ledger.interestPaid,
    remainingPrincipal: ledger.remainingPrincipal,
    remainingInterest: ledger.remainingInterest,
    remainingBalance: ledger.totalOutstanding,
    totalOutstanding: ledger.totalOutstanding,
    calculatedStatus: ledger.status,
    payments: payments.map((p) => {
      const match = ledger.paymentBreakdown.find((b) => String(b.paymentId) === String(p._id))
      return {
        ...p.toObject(),
        interest: match ? match.interestPaid : 0,
        principal: match ? match.principalPaid : p.amount,
        remaining: match ? match.remainingPrincipalAfter : 0,
      }
    }),
  }
}

export async function updateLoan(loanId, userId, updateData) {
  if (!isValidObjectId(loanId) || !isValidObjectId(userId)) {
    return null
  }

  const allowedUpdates = [
    'loanTitle',
    'loanType',
    'borrowerName',
    'lenderName',
    'phoneNumber',
    'loanAmount',
    'interestType',
    'interestRate',
    'startDate',
    'notes',
    'status',
  ]

  const filteredUpdates = {}
  Object.keys(updateData).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      filteredUpdates[key] = updateData[key]
    }
  })

  // Ensure loan belongs to the authenticated user before updating
  const updatedLoan = await Loan.findOneAndUpdate(
    { _id: loanId, userId },
    filteredUpdates,
    {
      new: true,
      runValidators: true,
    }
  )

  if (!updatedLoan) return null

  return getLoanById(loanId, userId)
}

export async function deleteLoan(loanId, userId) {
  if (!isValidObjectId(loanId) || !isValidObjectId(userId)) {
    return null
  }

  // Ensure loan belongs to the authenticated user before deleting
  const loan = await Loan.findOneAndDelete({ _id: loanId, userId })
  if (!loan) return null

  // Cascade delete all payments belonging to this loan
  await Payment.deleteMany({ loanId })

  return loan
}
