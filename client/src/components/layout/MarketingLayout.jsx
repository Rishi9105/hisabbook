import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export default function MarketingLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar variant="marketing" />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
