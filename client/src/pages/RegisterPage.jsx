import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

export default function RegisterPage() {
  const { labels } = useApp()
  const { register, loginGoogle } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill all required fields')
      return
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await register({ name: form.name, email: form.email, password: form.password })
      toast.success('Account created successfully!')
      navigate(ROUTES.DASHBOARD)
    } catch (error) {
      toast.error(error.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setLoading(true)
    try {
      await loginGoogle()
      toast.success('Signed up with Google!')
      navigate(ROUTES.DASHBOARD)
    } catch (error) {
      toast.error(error.message || 'Google signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{labels.register}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">{labels.freeHighlight}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={labels.name}
          name="name"
          placeholder="Your full name"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          required
        />
        <Input
          label={labels.email}
          type="email"
          name="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          required
        />
        <Input
          label={labels.password}
          type="password"
          name="password"
          placeholder="Create a password"
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          required
        />
        <Input
          label={labels.confirmPassword}
          type="password"
          name="confirmPassword"
          placeholder="Confirm your password"
          value={form.confirmPassword}
          onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
          required
        />

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Creating account...' : labels.register}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        <span className="text-sm text-slate-500">or</span>
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      </div>

      <Button variant="google" disabled={loading} className="w-full" onClick={handleGoogleSignup}>
        <GoogleIcon />
        {labels.continueGoogle}
      </Button>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="font-semibold text-brand-700 hover:underline dark:text-brand-300">
          {labels.login}
        </Link>
      </p>
    </div>
  )
}
