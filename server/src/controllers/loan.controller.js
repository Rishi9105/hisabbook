import * as loanService from '../services/loan.service.js'

export async function createLoan(req, res) {
  try {
    const { loanTitle, loanType, borrowerName, lenderName, loanAmount, interestType, interestRate } = req.body

    if (
      !loanTitle ||
      !loanType ||
      !borrowerName ||
      !lenderName ||
      loanAmount === undefined ||
      !interestType ||
      interestRate === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'Missing required loan fields (loanTitle, loanType, borrowerName, lenderName, loanAmount, interestType, interestRate)',
      })
    }

    // Always use authenticated user's ID from req.user
    const loan = await loanService.createLoan(req.user.id, req.body)
    return res.status(201).json({
      success: true,
      data: loan,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create loan',
    })
  }
}

export async function getLoans(req, res) {
  try {
    const { status } = req.query
    // Ignore any client-supplied userId; strictly query authenticated user's loans
    const loans = await loanService.getLoans(req.user.id, { status })
    return res.status(200).json({
      success: true,
      data: loans,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve loans',
    })
  }
}

export async function getLoanById(req, res) {
  try {
    const { id } = req.params
    const loan = await loanService.getLoanById(id, req.user.id)

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found or access denied',
      })
    }

    return res.status(200).json({
      success: true,
      data: loan,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve loan',
    })
  }
}

export async function updateLoan(req, res) {
  try {
    const { id } = req.params
    const updatedLoan = await loanService.updateLoan(id, req.user.id, req.body)

    if (!updatedLoan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found or access denied',
      })
    }

    return res.status(200).json({
      success: true,
      data: updatedLoan,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update loan',
    })
  }
}

export async function deleteLoan(req, res) {
  try {
    const { id } = req.params
    const deletedLoan = await loanService.deleteLoan(id, req.user.id)

    if (!deletedLoan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found or access denied',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Loan and associated payment records deleted successfully',
      data: deletedLoan,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete loan',
    })
  }
}
