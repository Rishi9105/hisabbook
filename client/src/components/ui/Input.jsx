export default function Input({
  label,
  id,
  hint,
  error,
  className = '',
  ...props
}) {
  const inputId = id || props.name

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-base font-medium text-slate-800 dark:text-slate-100">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-brand-900"
        {...props}
      />
      {hint && !error && <p className="text-sm text-slate-500 dark:text-slate-400">{hint}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
