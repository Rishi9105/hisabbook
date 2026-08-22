import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { ROUTES } from '../constants/routes'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.2-1.6 3.5-5.5 3.5-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.7 3.1 14.5 2 12 2 6.9 2 2.7 6.2 2.7 11.3S6.9 20.6 12 20.6c6.9 0 8.5-4.8 8.5-7.3 0-.5 0-.9-.1-1.3H12z"
      />
    </svg>
  )
}

export default function LoginPage() {
  const { labels } = useApp()
  const { login, loginGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const redirectTo = location.state?.from || ROUTES.DASHBOARD

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Please enter email and password')
      return
    }
    setLoading(true)
    try {
      await login({ email: form.email, password: form.password })
      toast.success('Welcome back!')
      navigate(redirectTo)
    } catch (error) {
      toast.error(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      await loginGoogle()
      toast.success('Signed in with Google!')
      navigate(redirectTo)
    } catch (error) {
      toast.error(error.message || 'Google sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{labels.login}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{labels.tagline}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={labels.email}
          type="email"
          name="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          autoComplete="email"
          required
        />
        <Input
          label={labels.password}
          type="password"
          name="password"
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          autoComplete="current-password"
          required
        />

        <div className="text-right">
          <button type="button" className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-300">
            {labels.forgotPassword}
          </button>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Signing in...' : labels.login}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        <span className="text-sm text-slate-500">or</span>
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      </div>

      <Button variant="google" disabled={loading} className="w-full" onClick={handleGoogleLogin}>
        <GoogleIcon />
        {labels.continueGoogle}
      </Button>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
        New here?{' '}
        <Link to={ROUTES.REGISTER} className="font-semibold text-brand-700 hover:underline dark:text-brand-300">
          {labels.register}
        </Link>
      </p>
    </div>
  )
}
