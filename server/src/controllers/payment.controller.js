import * as paymentService from '../services/payment.service.js'

export async function addPayment(req, res) {
  try {
    const { loanId } = req.params
    const payment = await paymentService.addPayment(loanId, req.user.id, req.body)

    return res.status(201).json({
      success: true,
      data: payment,
    })
  } catch (error) {
    if (error.message === 'LOAN_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'Loan not found or access denied',
      })
    }
    if (error.message === 'INVALID_AMOUNT') {
      return res.status(400).json({
        success: false,
        message: 'Payment amount must be greater than zero',
      })
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to add payment',
    })
  }
}

export async function getPaymentsByLoanId(req, res) {
  try {
    const { loanId } = req.params
    const payments = await paymentService.getPaymentsByLoanId(loanId, req.user.id)

    return res.status(200).json({
      success: true,
      data: payments,
    })
  } catch (error) {
    if (error.message === 'LOAN_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'Loan not found or access denied',
      })
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve payments',
    })
  }
}

export async function updatePayment(req, res) {
  try {
    const { paymentId } = req.params
    const updatedPayment = await paymentService.updatePayment(paymentId, req.user.id, req.body)

    if (!updatedPayment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found or access denied',
      })
    }

    return res.status(200).json({
      success: true,
      data: updatedPayment,
    })
  } catch (error) {
    if (error.message === 'INVALID_AMOUNT') {
      return res.status(400).json({
        success: false,
        message: 'Payment amount must be greater than zero',
      })
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update payment',
    })
  }
}

export async function deletePayment(req, res) {
  try {
    const { paymentId } = req.params
    const deletedPayment = await paymentService.deletePayment(paymentId, req.user.id)

    if (!deletedPayment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found or access denied',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Payment deleted successfully',
      data: deletedPayment,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete payment',
    })
  }
}
