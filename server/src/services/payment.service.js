import Loan from '../models/Loan.js'
import Payment from '../models/Payment.js'
import mongoose from 'mongoose'

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id)
}

export async function addPayment(loanId, userId, paymentData) {
  if (!isValidObjectId(loanId) || !isValidObjectId(userId)) {
    throw new Error('LOAN_NOT_FOUND')
  }

  // Verify that the target loan exists AND belongs to the authenticated user
  const loan = await Loan.findOne({ _id: loanId, userId })
  if (!loan) {
    throw new Error('LOAN_NOT_FOUND')
  }

  const amount = Number(paymentData.amount)
  if (isNaN(amount) || amount <= 0) {
    throw new Error('INVALID_AMOUNT')
  }

  const payment = await Payment.create({
    loanId,
    amount,
    paymentDate: paymentData.paymentDate || new Date(),
    paymentMethod: paymentData.paymentMethod || 'cash',
    note: paymentData.note || '',
  })

  return payment
}

export async function getPaymentsByLoanId(loanId, userId) {
  if (!isValidObjectId(loanId) || !isValidObjectId(userId)) {
    throw new Error('LOAN_NOT_FOUND')
  }

  // Verify that the target loan exists AND belongs to the authenticated user
  const loan = await Loan.findOne({ _id: loanId, userId })
  if (!loan) {
    throw new Error('LOAN_NOT_FOUND')
  }

  const payments = await Payment.find({ loanId }).sort({ paymentDate: -1, createdAt: -1 })
  return payments
}

export async function updatePayment(paymentId, userId, updateData) {
  if (!isValidObjectId(paymentId) || !isValidObjectId(userId)) {
    return null
  }

  const payment = await Payment.findById(paymentId)
  if (!payment) return null

  // Verify that the parent loan belongs to the authenticated user
  const loan = await Loan.findOne({ _id: payment.loanId, userId })
  if (!loan) return null

  const allowedUpdates = ['amount', 'paymentDate', 'paymentMethod', 'note']
  const filteredUpdates = {}
  Object.keys(updateData).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      filteredUpdates[key] = updateData[key]
    }
  })

  if (filteredUpdates.amount !== undefined) {
    const amt = Number(filteredUpdates.amount)
    if (isNaN(amt) || amt <= 0) {
      throw new Error('INVALID_AMOUNT')
    }
    filteredUpdates.amount = amt
  }

  const updatedPayment = await Payment.findByIdAndUpdate(paymentId, filteredUpdates, {
    new: true,
    runValidators: true,
  })

  return updatedPayment
}

export async function deletePayment(paymentId, userId) {
  if (!isValidObjectId(paymentId) || !isValidObjectId(userId)) {
    return null
  }

  const payment = await Payment.findById(paymentId)
  if (!payment) return null

  // Verify that the parent loan belongs to the authenticated user
  const loan = await Loan.findOne({ _id: payment.loanId, userId })
  if (!loan) return null

  const deletedPayment = await Payment.findByIdAndDelete(paymentId)
  return deletedPayment
}
