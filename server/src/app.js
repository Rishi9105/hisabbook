import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import healthRoutes from './routes/health.routes.js'
import loanRoutes from './routes/loan.routes.js'
import paymentRoutes from './routes/payment.routes.js'

const app = express()

// Security Headers with Helmet
app.use(helmet())

// Rate limiting for API protection
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
})

app.use('/api', apiLimiter)

// Strict CORS Configuration using CLIENT_URL environment variable
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
)

app.use(express.json())

app.get('/', (_req, res) => {
  res.status(200).json({
    name: 'HisabBook API',
    message: 'Backend is running. Use the frontend at http://localhost:5173',
    health: '/api/health',
  })
})

app.use('/api', healthRoutes)
app.use('/api/loans', loanRoutes)
app.use('/api/payments', paymentRoutes)

// Production Error Handling Middleware (Suppresses internal stack traces in production)
app.use((err, _req, res, _next) => {
  console.error('Unhandled server error:', err.message)
  return res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message || 'Internal server error',
  })
})

export default app
