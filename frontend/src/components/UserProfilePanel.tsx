import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { RootState } from '../store/store'
import { logout } from '../store/authSlice'
import {
  X, Flame, CheckCircle2, Clock, Zap, TrendingUp,
  Star, GitCommit, Award, Target, LogOut
} from 'lucide-react'

/* Ã¢â€â‚¬Ã¢â€â‚¬ Circular Progress Ring Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */
const Ring = ({
  pct, size = 80, stroke = 8, color = '#3b82f6', label, value,
}: {
  pct: number; size?: number; stroke?: number; color?: string; label: string; value: string
}) => {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={stroke} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={color} strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - dash }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-white">{pct}%</span>
        </div>
      </div>
      <p className="text-[10px] text-dark-400 text-center">{label}</p>
      <p className="text-xs font-semibold text-white">{value}</p>
    </div>
  )
}

/* Ã¢â€â‚¬Ã¢â€â‚¬ Mini Activity Heatmap Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */
const ActivityHeatmap = () => {
  const weeks = 15
  const days = 7
  // Generate mock contribution data
  const cells = Array.from({ length: weeks * days }, (_, i) => ({
    count: Math.random() < 0.35 ? 0 : Math.floor(Math.random() * 8),
  }))

  const getColor = (count: number) => {
    if (count === 0) return 'bg-dark-800'
    if (count < 2)  return 'bg-primary-900'
    if (count < 4)  return 'bg-primary-700'
    if (count < 6)  return 'bg-primary-500'
    return 'bg-primary-400'
  }

  return (
    <div>
      <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">Activity Ã¢â‚¬â€ Last 15 Weeks</p>
      <div className="flex gap-0.5">
        {Array.from({ length: weeks }).map((_, w) => (
          <div key={w} className="flex flex-col gap-0.5">
            {Array.from({ length: days }).map((_, d) => {
              const cell = cells[w * days + d]
              return (
                <div
                  key={d}
                  title={`${cell.count} contributions`}
                  className={`w-2.5 h-2.5 rounded-sm ${getColor(cell.count)} transition-all hover:scale-150 cursor-pointer`}
                />
              )
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-2">
        <span className="text-[9px] text-dark-500">Less</span>
        {['bg-dark-800', 'bg-primary-900', 'bg-primary-700', 'bg-primary-500', 'bg-primary-400'].map(c => (
          <div key={c} className={`w-2.5 h-2.5 rounded-sm ${c}`} />
        ))}
        <span className="text-[9px] text-dark-500">More</span>
      </div>
    </div>
  )
}

/* Ã¢â€â‚¬Ã¢â€â‚¬ Animated Counter Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */
const Counter = ({ target, suffix = '' }: { target: number; suffix?: string }) => {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = 0
    const step = Math.ceil(target / 40)
    const id = setInterval(() => {
      start = Math.min(start + step, target)
      setVal(start)
      if (start >= target) clearInterval(id)
    }, 25)
    return () => clearInterval(id)
  }, [target])
  return <span>{val}{suffix}</span>
}

/* Ã¢â€â‚¬Ã¢â€â‚¬ Sparkline Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */
const Sparkline = ({ data, color = '#3b82f6' }: { data: number[]; color?: string }) => {
  const max = Math.max(...data)
  const w = 80, h = 28, pad = 2
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2)
    const y = h - pad - ((v / max) * (h - pad * 2))
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline
        points={`${pad},${h} ${pts} ${w - pad},${h}`}
        fill={color} fillOpacity="0.1" stroke="none"
      />
    </svg>
  )
}

/* Ã¢â€â‚¬Ã¢â€â‚¬ Main Panel Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */
export const UserProfilePanel = ({ onClose }: { onClose: () => void }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((s: RootState) => s.auth.user)
  const { tasks, projects } = useSelector((s: RootState) => s.workspace)
  const { teamMembers } = useSelector((s: RootState) => s.sprint)

  const handleLogout = () => {
    dispatch(logout())
    onClose()
    navigate('/login')
  }

  const me = teamMembers[0]
  const myTasks = tasks.filter(t => me?.tasksAssigned.includes(t.id))
  const donePct = myTasks.length > 0 ? Math.round((myTasks.filter(t => t.status === 'DONE').length / myTasks.length) * 100) : 0
  const inProgress = myTasks.filter(t => t.status === 'IN_PROGRESS').length
  const totalPoints = myTasks.reduce((s, t) => s + t.points, 0)
  const activeProjects = projects.filter(p => p.status === 'ACTIVE').length
  const streakDays = 12
  const velocityHistory = [32, 38, 35, 42, 48, 44, 55]

  const badges = [
    { icon: Flame,       label: `${streakDays}-Day Streak`,  color: 'text-orange-400 bg-orange-400/10' },
    { icon: Star,        label: 'Top Contributor',           color: 'text-yellow-400 bg-yellow-400/10' },
    { icon: Award,       label: 'Sprint Hero',               color: 'text-purple-400 bg-purple-400/10' },
    { icon: GitCommit,   label: '50+ Commits',               color: 'text-emerald-400 bg-emerald-400/10' },
  ]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end p-4 sm:p-6 bg-dark-950/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: 'spring' as const, stiffness: 260, damping: 26 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-md bg-dark-900/98 backdrop-blur-xl border border-dark-700 rounded-3xl shadow-2xl shadow-black/60 overflow-hidden"
        >
          {/* Hero Banner */}
          <div className="relative h-28 bg-gradient-to-br from-primary-900/60 via-indigo-900/40 to-purple-900/30 overflow-hidden">
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-primary-500/10 blur-3xl" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-indigo-500/10 blur-2xl" />
            {/* Floating mini sparkline in banner */}
            <div className="absolute bottom-3 right-4 opacity-40">
              <Sparkline data={velocityHistory} color="#61dafb" />
            </div>
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 bg-dark-800/60 border border-dark-700 rounded-xl text-dark-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Avatar floats over banner */}
          <div className="px-5 pb-5">
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="relative">
                <img
                  src={user?.avatar || "https://i.pravatar.cc/150?u=devflow"}
                  alt="Avatar"
                  className="w-20 h-20 rounded-2xl border-4 border-dark-900 shadow-xl bg-slate-800"
                />
                <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-dark-900 rounded-full" />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>

            <div className="mb-4">
              <h2 className="text-xl font-bold text-white">{user?.name || 'Developer'}</h2>
              <p className="text-sm text-dark-400">{user?.email || 'dev@devflow.io'} · {(user?.role || 'Developer').toUpperCase()}</p>
            </div>

            {/* Streak badge */}
            <div className="flex items-center gap-2 mb-5 p-3 bg-orange-500/8 border border-orange-500/20 rounded-2xl">
              <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
              <div>
                <p className="text-sm font-semibold text-white"><Counter target={streakDays} /> day streak 🔥</p>
                <p className="text-[10px] text-dark-400">Active every day this month</p>
              </div>
              <div className="ml-auto">
                <Sparkline data={[1,1,1,0,1,1,1,1,0,1,1,1]} color="#fb923c" />
              </div>
            </div>

            {/* KPI Rings */}
            <div className="flex justify-around mb-5">
              <Ring pct={donePct}  color="#10b981" label="Completion"  value={`${myTasks.filter(t=>t.status==='DONE').length}/${myTasks.length}`} />
              <Ring pct={Math.min(inProgress * 25, 100)} color="#3b82f6" label="In Progress" value={`${inProgress} tasks`} />
              <Ring pct={Math.min(totalPoints * 3, 100)} color="#8b5cf6" label="Story Points" value={`${totalPoints} SP`} />
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { icon: Target,      label: 'Active Projects', value: activeProjects, color: 'text-primary-400', spark: [1,2,2,3,2,3,3] },
                { icon: CheckCircle2,label: 'Done Tasks',      value: tasks.filter(t=>t.status==='DONE').length, color: 'text-emerald-400', spark: [1,2,3,2,4,3,5] },
                { icon: Zap,         label: 'Avg Velocity',    value: 48,             color: 'text-amber-400',   spark: [32,38,35,42,48,44,55] },
              ].map((s, i) => {
                const Icon = s.icon
                return (
                  <div key={i} className="bg-dark-800/50 rounded-2xl p-3 border border-dark-700/50">
                    <div className="flex items-center justify-between mb-1">
                      <Icon className={`w-3.5 h-3.5 ${s.color}`} />
                      <Sparkline data={s.spark} color={s.color.replace('text-', '').includes('primary') ? '#3b82f6' : s.color.includes('emerald') ? '#10b981' : '#f59e0b'} />
                    </div>
                    <p className="text-lg font-bold text-white"><Counter target={s.value} /></p>
                    <p className="text-[10px] text-dark-500">{s.label}</p>
                  </div>
                )
              })}
            </div>

            {/* Activity Heatmap */}
            <div className="mb-5 p-3 bg-dark-800/40 rounded-2xl border border-dark-700/50">
              <ActivityHeatmap />
            </div>

            {/* Badges */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2.5">Achievements</p>
              <div className="grid grid-cols-2 gap-2">
                {badges.map((b, i) => {
                  const Icon = b.icon
                  return (
                    <div key={i} className={`flex items-center gap-2 p-2.5 rounded-xl border border-dark-700/50 ${b.color.split(' ')[1]}`}>
                      <Icon className={`w-4 h-4 ${b.color.split(' ')[0]} flex-shrink-0`} />
                      <span className="text-xs font-medium text-white">{b.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Velocity sparkline */}
            <div className="p-3 bg-dark-800/40 rounded-2xl border border-dark-700/50">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-dark-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-primary-400" /> Velocity Trend (Last 7 Sprints)
                </p>
                <span className="text-xs font-bold text-primary-400">Ã¢â€ â€˜ 12%</span>
              </div>
              <div className="flex items-end gap-1.5">
                {velocityHistory.map((v, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${(v / 60) * 48}px` }}
                    transition={{ delay: i * 0.08, duration: 0.5, ease: 'easeOut' }}
                    className="flex-1 rounded-t-md bg-gradient-to-t from-primary-700 to-primary-400 relative group"
                  >
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{v}</div>
                  </motion.div>
                ))}
              </div>
              <div className="flex justify-between mt-1.5">
                {['S1','S2','S3','S4','S5','S6','S7'].map(s => (
                  <span key={s} className="text-[9px] text-dark-500 flex-1 text-center">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
