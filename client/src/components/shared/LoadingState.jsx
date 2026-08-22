export default function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      <p className="text-base text-slate-600 dark:text-slate-300">{message}</p>
    </div>
  )
}
