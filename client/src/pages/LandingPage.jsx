import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ROUTES } from '../constants/routes'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

const featureIcons = ['📒', '🧮', '📋', '📄', '🤝']

export default function LandingPage() {
  const navigate = useNavigate()
  const { labels } = useApp()

  const features = [
    { title: labels.features.tracking, description: labels.features.trackingDesc },
    { title: labels.features.interest, description: labels.features.interestDesc },
    { title: labels.features.history, description: labels.features.historyDesc },
    { title: labels.features.pdf, description: labels.features.pdfDesc },
    { title: labels.features.simple, description: labels.features.simpleDesc },
  ]

  const steps = [
    'Loan ki rakam aur byaaj dar enter karein',
    'Jab bhi payment ho, amount aur date likhein',
    'HisabBook baaki rakam aur byaaj khud dikhata hai',
  ]

  return (
    <div>
      <section className="bg-gradient-to-b from-brand-50 to-white px-4 py-16 dark:from-slate-900 dark:to-slate-950 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
            {labels.freeHighlight}
          </p>
          <h1 className="mt-4 text-4xl font-bold text-slate-900 dark:text-white md:text-6xl">
            {labels.appName}
          </h1>
          <p className="mt-4 text-xl text-brand-700 dark:text-brand-300 md:text-2xl">{labels.tagline}</p>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
            {labels.heroSubtext}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" onClick={() => navigate(ROUTES.REGISTER)}>
              {labels.startFree}
            </Button>
            <Button size="lg" variant="secondary" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
              {labels.howItWorks}
            </Button>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Why HisabBook?</h2>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">
            Simple tools for real-life loan tracking — not complicated bank software.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={feature.title}>
              <div className="text-3xl">{featureIcons[index]}</div>
              <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">{feature.title}</h3>
              <p className="mt-2 text-base text-slate-600 dark:text-slate-300">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="bg-white px-4 py-16 dark:bg-slate-900 md:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-white">{labels.howItWorks}</h2>
          <div className="mt-10 space-y-4">
            {steps.map((step, index) => (
              <div
                key={step}
                className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white">
                  {index + 1}
                </span>
                <p className="pt-2 text-lg text-slate-700 dark:text-slate-200">{step}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button size="lg" onClick={() => navigate(ROUTES.REGISTER)}>
              {labels.startFree}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
