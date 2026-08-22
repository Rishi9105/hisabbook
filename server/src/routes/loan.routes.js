import { Router } from 'express'
import { authenticateUser } from '../middleware/auth.middleware.js'
import * as loanController from '../controllers/loan.controller.js'
import * as paymentController from '../controllers/payment.controller.js'

const router = Router()

// Protect all loan and nested payment endpoints with authentication middleware
router.use(authenticateUser)

// Loan endpoints
router.post('/', loanController.createLoan)
router.get('/', loanController.getLoans)
router.get('/:id', loanController.getLoanById)
router.put('/:id', loanController.updateLoan)
router.delete('/:id', loanController.deleteLoan)

// Nested Payment endpoints for a loan
router.post('/:loanId/payments', paymentController.addPayment)
router.get('/:loanId/payments', paymentController.getPaymentsByLoanId)

export default router
