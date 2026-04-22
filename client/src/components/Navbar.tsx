import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Compass, Search, BookOpen, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/explore', icon: Compass, label: 'Explore' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/journal', icon: BookOpen, label: 'Journal' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <button onClick={() => navigate('/')} className="font-serif text-xl font-semibold text-foreground">
            FootNotes
          </button>
          {!user && (
            <Link to="/auth" className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">
              Sign in
            </Link>
          )}
        </div>
      </header>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur md:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to
            return (
              <Link key={to} to={to} className="flex flex-col items-center gap-0.5 px-3 py-1">
                <Icon className={`h-5 w-5 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-[10px] ${active ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Side nav (desktop) */}
      <nav className="fixed left-0 top-14 hidden h-[calc(100vh-3.5rem)] w-56 flex-col border-r border-border bg-background px-3 py-6 md:flex">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to
          return (
            <Link
              key={to}
              to={to}
              className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                ${active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}