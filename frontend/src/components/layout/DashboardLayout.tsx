import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FolderKanban as FolderKanbanIcon, CheckSquare, Search,
  Brain, Calendar, BarChart2, Map, Zap, Users, X, ArrowRight,
  Command, ChevronLeft, ChevronRight, Sun, Moon, Plus
} from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../store/store'
import { toggleSidebar, setMode } from '../../store/themeSlice'
import { fetchProjects, fetchTasks, reloadWorkspaceForUser } from '../../store/workspaceSlice'
import { ReactLogo } from '../ReactLogo'
import { UserProfilePanel } from '../UserProfilePanel'
import { NotificationBell } from '../notifications/NotificationBell'
import { ErrorBoundary } from '../ErrorBoundary'

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs))
}

const navItems = [
  { icon: LayoutDashboard,  label: 'Command Center', path: '/' },
  { icon: LayoutDashboard,  label: 'Dashboard',      path: '/dashboard' },
  { icon: FolderKanbanIcon, label: 'Projects',       path: '/projects' },
  { icon: CheckSquare,      label: 'My Tasks',       path: '/tasks' },
  { icon: Calendar,         label: 'Calendar',       path: '/calendar' },
  { icon: BarChart2,        label: 'Analytics',      path: '/analytics' },
  { icon: Brain,            label: 'AI Insights',    path: '/ai-insights' },
  { icon: Zap,              label: 'Sprints',        path: '/sprints' },
  { icon: Map,              label: 'Roadmap',        path: '/roadmap' },
  { icon: Users,            label: 'Team',           path: '/team' },
]

export const DashboardLayout = () => {
  const location  = useLocation()
  const navigate  = useNavigate()
  const dispatch  = useDispatch()
  const { sidebarCollapsed, mode } = useSelector((s: RootState) => s.theme)
  const { tasks, projects }        = useSelector((s: RootState) => s.workspace)
  const user = useSelector((s: RootState) => s.auth.user)

  const [searchOpen,  setSearchOpen]  = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  /* Global data fetch & user workspace reload */
  useEffect(() => {
    if (user?.id) {
      dispatch(reloadWorkspaceForUser(user.id))
    }
    dispatch(fetchProjects() as any).then((action: any) => {
      if (action.payload && Array.isArray(action.payload)) {
        action.payload.forEach((p: any) => dispatch(fetchTasks(p.id) as any))
      }
    })
  }, [dispatch, user?.id])

  /* Global keyboard shortcuts */
  useEffect(() => {
    let gPressed = false
    const handle = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if ((e.metaKey || e.ctrlKey) && e.key === '/') { e.preventDefault(); setSearchOpen(v => !v); return }
      if (e.key === 'Escape') { setSearchOpen(false); setProfileOpen(false); return }
      if (e.key === 'g' || e.key === 'G') { gPressed = true; setTimeout(() => { gPressed = false }, 1000); return }
      if (gPressed) {
        const map: Record<string, string> = {
          h: '/', d: '/dashboard', p: '/projects', t: '/tasks',
          c: '/calendar', a: '/analytics', i: '/ai-insights',
          s: '/sprints', r: '/roadmap', m: '/team',
        }
        if (map[e.key]) { navigate(map[e.key]); gPressed = false }
      }
    }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [navigate])

  const safeTasks        = Array.isArray(tasks) ? tasks : []
  const safeProjects     = Array.isArray(projects) ? projects : []
  const filteredTasks    = safeTasks.filter(t => (t?.content || '').toLowerCase().includes(searchQuery.toLowerCase()) || (t?.key || '').toLowerCase().includes(searchQuery.toLowerCase()))
  const filteredProjects = safeProjects.filter(p => (p?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (p?.key || '').toLowerCase().includes(searchQuery.toLowerCase()))

  const currentNavLabel = navItems.find(n => n.path === location.pathname)?.label ?? 'DevFlow'

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden text-slate-100 font-sans selection:bg-primary-500/30">

      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 72 : 240 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}
        className="relative flex-shrink-0 flex flex-col z-20 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg,rgb(10 14 30/0.98) 0%,rgb(8 12 25/0.98) 100%)',
          borderRight: '1px solid rgb(51 65 85/0.4)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary-900/20 to-transparent pointer-events-none" />

        {/* Logo row */}
        <div className="h-16 flex items-center px-3 gap-2.5 flex-shrink-0 border-b border-slate-800/50">
          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
            <ReactLogo size={36} animate />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="overflow-hidden"
              >
                <p className="text-sm font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#61dafb] via-white to-slate-300 whitespace-nowrap">
                  DevFlow
                </p>
                <p className="text-[9px] text-slate-500 whitespace-nowrap tracking-widest uppercase">
                  Powered by React
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {!sidebarCollapsed && (
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-3 px-3">Navigation</p>
          )}
          {navItems.map(item => {
            const Icon  = item.icon
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                title={sidebarCollapsed ? item.label : undefined}
                className={cn(
                  'relative flex items-center rounded-xl transition-all duration-200 group overflow-hidden',
                  sidebarCollapsed ? 'px-3 py-3 justify-center' : 'px-3 py-2.5 gap-3',
                  active
                    ? 'text-[#61dafb]'
                    : 'text-slate-500 hover:text-slate-200'
                )}
              >
                {active && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'linear-gradient(135deg,rgb(97 218 251/0.12),rgb(59 130 246/0.08))', border: '1px solid rgb(97 218 251/0.2)' }}
                    transition={{ type: 'spring' as const, stiffness: 400, damping: 35 }}
                  />
                )}
                <Icon className={cn('w-4.5 h-4.5 flex-shrink-0 relative z-10 transition-transform duration-200', active ? 'scale-110' : 'group-hover:scale-110')} style={{ width: 18, height: 18 }} />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden relative z-10"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                    {item.label}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User avatar row */}
        <div className="p-2 border-t border-slate-800/50 flex-shrink-0">
          <button
            onClick={() => setProfileOpen(true)}
            className={cn(
              'w-full flex items-center rounded-xl hover:bg-slate-800/60 cursor-pointer transition-all p-2 gap-2.5 group',
              sidebarCollapsed && 'justify-center'
            )}
          >
            <div className="relative flex-shrink-0">
              <img
                src={user?.avatar || `https://i.pravatar.cc/150?u=devflow`}
                alt="User"
                className="w-8 h-8 rounded-xl border-2 border-slate-700 group-hover:border-[#61dafb]/50 transition-colors bg-slate-800"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#020617] rounded-full" />
            </div>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden text-left"
                >
                  <p className="text-xs font-semibold text-white whitespace-nowrap">{user?.name || 'Developer'}</p>
                  <p className="text-[10px] text-slate-500 whitespace-nowrap">{user?.email || 'dev@devflow.io'}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary-900/10 blur-[140px]" />
          <div className="absolute -bottom-40 -right-20 w-96 h-96 rounded-full bg-indigo-900/10 blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#61dafb]/3 blur-[160px]" />
        </div>

        {/* Header */}
        <header
          className="h-14 px-4 flex items-center justify-between gap-4 flex-shrink-0 z-10"
          style={{
            background: 'rgb(2 6 23/0.8)',
            borderBottom: '1px solid rgb(51 65 85/0.3)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-slate-500">DevFlow</span>
              <span className="text-slate-700">/</span>
              <span className="text-white font-medium">{currentNavLabel}</span>
            </div>
          </div>

          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm text-slate-500 hover:text-slate-200 transition-all group w-56"
            style={{ background: 'rgb(15 23 42/0.6)', borderColor: 'rgb(51 65 85/0.5)' }}
          >
            <Search className="w-3.5 h-3.5 group-hover:text-[#61dafb] transition-colors flex-shrink-0" />
            <span className="flex-1 text-left">Search…</span>
            <kbd className="hidden sm:block text-[9px] font-mono bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-500">⌘/</kbd>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => dispatch(setMode(mode === 'dark' ? 'light' : 'dark'))}
              className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
            >
              {mode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <NotificationBell userId={user?.id || 'anonymous'} />

            <button
              onClick={() => navigate('/tasks')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all text-white"
              style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5)', boxShadow: '0 0 20px rgb(59 130 246/0.25)' }}
            >
              <Plus className="w-3.5 h-3.5" /> New Task
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>

      {/* Global Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-20"
            style={{ background: 'rgb(2 6 23/0.85)', backdropFilter: 'blur(8px)' }}
            onClick={() => { setSearchOpen(false); setSearchQuery('') }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: 'spring' as const, damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
              style={{ background: 'rgb(10 14 30/0.98)', border: '1px solid rgb(97 218 251/0.15)', backdropFilter: 'blur(24px)', boxShadow: '0 0 60px rgb(97 218 251/0.08)' }}
            >
              <div className="relative border-b border-slate-800">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#61dafb]" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search projects, tasks, pages…"
                  className="w-full pl-11 pr-12 py-4 bg-transparent text-white placeholder-slate-500 focus:outline-none text-base"
                />
                <button onClick={() => { setSearchOpen(false); setSearchQuery('') }} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto p-2">
                {searchQuery === '' ? (
                  <div className="p-6 text-center">
                    <Command className="w-7 h-7 mx-auto mb-3 text-slate-600" />
                    <p className="text-sm text-slate-500 mb-4">Type to search your workspace</p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {navItems.slice(0, 7).map(item => (
                        <button key={item.path} onClick={() => { navigate(item.path); setSearchOpen(false) }}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-[11px] text-slate-400 hover:text-white hover:border-slate-600 transition-colors">
                          <item.icon className="w-3 h-3" /> {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {filteredProjects.map(p => (
                      <button key={p.id} onClick={() => { navigate('/projects'); setSearchOpen(false); setSearchQuery('') }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#61dafb]/5 hover:text-[#61dafb] transition-colors group">
                        <FolderKanbanIcon className="w-4 h-4 text-slate-500 group-hover:text-[#61dafb] flex-shrink-0" />
                        <span className="flex-1 text-left text-sm text-white group-hover:text-[#61dafb]">{p.name}</span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" />
                      </button>
                    ))}
                    {filteredTasks.slice(0, 5).map(t => (
                      <button key={t.id} onClick={() => { navigate('/tasks'); setSearchOpen(false); setSearchQuery('') }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-500/8 hover:text-indigo-400 transition-colors group">
                        <CheckSquare className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 flex-shrink-0" />
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 rounded flex-shrink-0">{t.key}</span>
                        <span className="flex-1 text-left text-sm text-white group-hover:text-indigo-300 truncate">{t.content}</span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" />
                      </button>
                    ))}
                    {filteredProjects.length === 0 && filteredTasks.length === 0 && (
                      <div className="p-8 text-center text-slate-500 text-sm">No results for "{searchQuery}"</div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Profile Panel */}
      <AnimatePresence>
        {profileOpen && <UserProfilePanel onClose={() => setProfileOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}
