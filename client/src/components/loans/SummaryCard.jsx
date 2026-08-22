import Card from '../ui/Card'

export default function SummaryCard({ title, value, hint, accent = 'brand' }) {
  const accents = {
    brand: 'text-brand-700 dark:text-brand-300',
    emerald: 'text-emerald-700 dark:text-emerald-300',
    amber: 'text-amber-700 dark:text-amber-300',
    slate: 'text-slate-700 dark:text-slate-200',
  }

  return (
    <Card className="h-full">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
      <p className={`mt-2 text-2xl font-bold md:text-3xl ${accents[accent]}`}>{value}</p>
      {hint && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{hint}</p>}
    </Card>
  )
}
