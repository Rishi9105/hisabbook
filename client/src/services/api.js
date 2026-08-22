import axios from 'axios'
import { auth } from './firebase'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to attach Firebase ID Token on all outbound API requests
api.interceptors.request.use(
  async (config) => {
    try {
      const currentUser = auth.currentUser
      if (currentUser) {
        const token = await currentUser.getIdToken()
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      console.error('Failed to attach auth token to request:', error)
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Loan API endpoints (Scoped to authenticated Firebase user)
export const getLoans = async (status) => {
  const params = {}
  if (status) params.status = status
  const response = await api.get('/loans', { params })
  return response.data
}

export const getLoan = async (id) => {
  const response = await api.get(`/loans/${id}`)
  return response.data
}

export const createLoan = async (loanData) => {
  const response = await api.post('/loans', loanData)
  return response.data
}

export const updateLoan = async (id, loanData) => {
  const response = await api.put(`/loans/${id}`, loanData)
  return response.data
}

export const deleteLoan = async (id) => {
  const response = await api.delete(`/loans/${id}`)
  return response.data
}

// Payment API endpoints (Scoped to authenticated Firebase user's loans)
export const getPayments = async (loanId) => {
  const response = await api.get(`/loans/${loanId}/payments`)
  return response.data
}

export const addPayment = async (loanId, paymentData) => {
  const response = await api.post(`/loans/${loanId}/payments`, paymentData)
  return response.data
}

export const updatePayment = async (paymentId, paymentData) => {
  const response = await api.put(`/payments/${paymentId}`, paymentData)
  return response.data
}

export const deletePayment = async (paymentId) => {
  const response = await api.delete(`/payments/${paymentId}`)
  return response.data
}

export default api
