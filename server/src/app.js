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

// Strict CORS Configuration allowing production Vercel domain and configured CLIENT_URL
const configuredClientUrl = (process.env.CLIENT_URL || 'https://hisabbook-sigma.vercel.app').trim().replace(/\/+$/, '')

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      const cleanOrigin = origin.replace(/\/+$/, '')
      if (
        cleanOrigin === configuredClientUrl ||
        cleanOrigin === 'https://hisabbook-sigma.vercel.app' ||
        cleanOrigin === 'http://localhost:5173'
      ) {
        return callback(null, true)
      }
      return callback(null, false)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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
