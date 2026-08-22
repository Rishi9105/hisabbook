import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import MarketingLayout from './components/layout/MarketingLayout'
import AuthLayout from './components/layout/AuthLayout'
import DashboardLayout from './components/layout/DashboardLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import CreateLoanPage from './pages/CreateLoanPage'
import LoanDetailsPage from './pages/LoanDetailsPage'
import AddPaymentPage from './pages/AddPaymentPage'
import SettingsPage from './pages/SettingsPage'
import NotFoundPage from './pages/NotFoundPage'
import { ROUTES } from './constants/routes'

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<MarketingLayout />}>
              <Route path={ROUTES.HOME} element={<LandingPage />} />
            </Route>

            <Route element={<AuthLayout />}>
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />
              <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
            </Route>

            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
              <Route path={ROUTES.CREATE_LOAN} element={<CreateLoanPage />} />
              <Route path="/loans/:id" element={<LoanDetailsPage />} />
              <Route path="/loans/:id/payment" element={<AddPaymentPage />} />
              <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
            </Route>

            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              fontSize: '16px',
              borderRadius: '12px',
              padding: '12px 16px',
            },
          }}
        />
      </AppProvider>
    </AuthProvider>
  )
}

export default App
