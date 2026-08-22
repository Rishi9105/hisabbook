import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ROUTES } from '../constants/routes'
import Button from '../components/ui/Button'

export default function NotFoundPage() {
  const navigate = useNavigate()
  const { labels } = useApp()

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-7xl font-bold text-brand-600">404</p>
      <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">{labels.pageNotFound}</h1>
      <p className="mt-3 max-w-md text-lg text-slate-600 dark:text-slate-300">
        The page you are looking for does not exist or may have moved.
      </p>
      <Button className="mt-8" size="lg" onClick={() => navigate(ROUTES.HOME)}>
        {labels.goHome}
      </Button>
    </div>
  )
}
