import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { ROUTES } from '../../constants/routes'
import Button from '../ui/Button'

function navLinkClass({ isActive }) {
  return isActive
    ? 'text-brand-700 font-semibold dark:text-brand-300'
    : 'text-slate-600 hover:text-brand-700 dark:text-slate-300 dark:hover:text-brand-300'
}

export default function Navbar({ variant = 'marketing' }) {
  const { isAuthenticated, user, logout } = useAuth()
  const { labels } = useApp()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate(ROUTES.HOME)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <Link to={ROUTES.HOME} className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white">
            H
          </span>
          <div>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{labels.appName}</p>
            <p className="hidden text-xs text-slate-500 sm:block">{labels.tagline}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {variant === 'marketing' && (
            <>
              <a href="#features" className="text-slate-600 hover:text-brand-700 dark:text-slate-300">
                Features
              </a>
              <a href="#how-it-works" className="text-slate-600 hover:text-brand-700 dark:text-slate-300">
                {labels.howItWorks}
              </a>
            </>
          )}
          {variant === 'dashboard' && (
            <>
              <NavLink to={ROUTES.DASHBOARD} className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to={ROUTES.CREATE_LOAN} className={navLinkClass}>
                {labels.newLoan}
              </NavLink>
              <NavLink to={ROUTES.SETTINGS} className={navLinkClass}>
                {labels.settings}
              </NavLink>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <span className="hidden text-sm text-slate-600 dark:text-slate-300 sm:inline">
                {user?.name}
              </span>
              {variant === 'marketing' ? (
                <Button size="sm" onClick={() => navigate(ROUTES.DASHBOARD)}>
                  Dashboard
                </Button>
              ) : (
                <Button size="sm" variant="secondary" onClick={handleLogout}>
                  {labels.logout}
                </Button>
              )}
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.LOGIN)}>
                {labels.login}
              </Button>
              <Button size="sm" onClick={() => navigate(ROUTES.REGISTER)}>
                {labels.register}
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
