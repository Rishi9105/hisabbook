export default function Card({ children, className = '', padding = 'p-5 md:p-6' }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 ${padding} ${className}`}
    >
      {children}
    </div>
  )
}
