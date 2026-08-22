import { Router } from 'express'
import { authenticateUser } from '../middleware/auth.middleware.js'
import * as paymentController from '../controllers/payment.controller.js'

const router = Router()

// Protect all top-level payment endpoints with authentication middleware
router.use(authenticateUser)

// Direct Payment endpoints by paymentId
router.put('/:paymentId', paymentController.updatePayment)
router.delete('/:paymentId', paymentController.deletePayment)

export default router
