import { useApp } from '../../context/AppContext'

export default function Footer() {
  const { labels } = useApp()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{labels.appName}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{labels.tagline}</p>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          © {year} HisabBook. {labels.freeHighlight}
        </p>
      </div>
    </footer>
  )
}
