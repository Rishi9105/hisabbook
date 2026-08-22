export default function ProgressBar({ value = 0, max = 100, label }) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
          <span>{label}</span>
          <span className="font-semibold text-slate-900 dark:text-white">{percent}%</span>
        </div>
      )}
      <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
        <div
          className="h-full rounded-full bg-brand-600 transition-all"
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}
