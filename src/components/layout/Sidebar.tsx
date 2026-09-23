import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Briefcase,
  Building2,
  Users,
  Bell,
  Settings,
  LogOut,
  BriefcaseBusiness,
  Moon,
  Sun,
  Monitor,
  Clapperboard,
  Kanban,
} from 'lucide-react'
import { useAuth } from '@/features/auth/AuthProvider'
import { useTheme } from '@/features/theme/ThemeProvider'
import { cn } from '@/lib/utils'

const jobSearchItems = [
  { to: '/opportunities', icon: Briefcase, label: 'Opportunities' },
  { to: '/companies', icon: Building2, label: 'Companies' },
  { to: '/contacts', icon: Users, label: 'Contacts' },
  { to: '/followups', icon: Bell, label: 'Follow-ups' },
]

const contentItems = [
  { to: '/content', icon: Clapperboard, label: 'Content Dashboard', end: true },
  { to: '/content/pipeline', icon: Kanban, label: 'Pipeline' },
]

function NavItem({
  to,
  icon: Icon,
  label,
  end,
}: {
  to: string
  icon: typeof Briefcase
  label: string
  end?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-sidebar-foreground/70 hover:bg-accent hover:text-accent-foreground'
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </NavLink>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 select-none">
      {children}
    </p>
  )
}

export function Sidebar() {
  const { signOut, user } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const themeOptions: { value: 'light' | 'dark' | 'system'; icon: typeof Sun; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ]

  const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
  const currentThemeOption = themeOptions.find((t) => t.value === theme) ?? themeOptions[2]
  const ThemeIcon = currentThemeOption.icon

  return (
    <aside className="flex h-full w-56 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 px-4 border-b border-sidebar-border">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
          <BriefcaseBusiness className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-sm font-semibold tracking-tight">JobTrack</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {/* Dashboard */}
        <NavItem to="/" icon={LayoutDashboard} label="Dashboard" end />

        {/* Job Search section */}
        <SectionLabel>Job Search</SectionLabel>
        {jobSearchItems.map(({ to, icon, label }) => (
          <NavItem key={to} to={to} icon={icon} label={label} />
        ))}

        {/* Content section */}
        <SectionLabel>Content</SectionLabel>
        {contentItems.map(({ to, icon, label, end }) => (
          <NavItem key={to} to={to} icon={icon} label={label} end={end} />
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-sidebar-border px-2 py-3 space-y-0.5">
        {/* Theme toggle */}
        <button
          type="button"
          onClick={() => setTheme(nextTheme)}
          title={`Current: ${currentThemeOption.label}. Click to switch.`}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <ThemeIcon className="h-4 w-4 shrink-0" />
          {currentThemeOption.label} mode
        </button>

        {/* Settings */}
        <NavItem to="/settings" icon={Settings} label="Settings" />

        {/* User + sign out */}
        <div className="pt-1 border-t border-sidebar-border mt-1">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary uppercase">
              {user?.email?.[0] ?? '?'}
            </div>
            <span className="flex-1 truncate text-xs text-muted-foreground">{user?.email}</span>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  )
}
