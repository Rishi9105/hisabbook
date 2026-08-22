import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { ROUTES } from '../constants/routes'
import { getInitials } from '../utils/format'
import PageHeader from '../components/shared/PageHeader'
import Card from '../components/ui/Card'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { labels, language, setLanguage, theme, setTheme } = useApp()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    navigate(ROUTES.HOME)
  }

  return (
    <div>
      <PageHeader title={labels.settings} subtitle="Manage your profile and app preferences." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              {getInitials(user?.name)}
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{user?.name}</p>
              <p className="text-slate-600 dark:text-slate-300">{user?.email}</p>
            </div>
          </div>
        </Card>

        <Card className="space-y-5">
          <Select
            label={labels.language}
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            options={[
              { value: 'en', label: labels.english },
              { value: 'hi', label: labels.hindi },
            ]}
          />

          <Select
            label={labels.theme}
            value={theme}
            onChange={(event) => setTheme(event.target.value)}
            options={[
              { value: 'light', label: labels.light },
              { value: 'dark', label: labels.dark },
            ]}
          />
        </Card>
      </div>

      <Card className="mt-6 max-w-md">
        <Button variant="danger" className="w-full" onClick={handleLogout}>
          {labels.logout}
        </Button>
      </Card>
    </div>
  )
}
