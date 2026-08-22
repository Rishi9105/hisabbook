import { Outlet } from 'react-router-dom'
import Card from '../ui/Card'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-slate-100 px-4 py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
        <Card className="w-full shadow-lg">
          <Outlet />
        </Card>
      </div>
    </div>
  )
}
