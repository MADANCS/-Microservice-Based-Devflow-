import { useEffect, useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { Activity, Clock, CheckCircle2, AlertCircle, TrendingUp, Sparkles, ArrowUp, Zap } from 'lucide-react'
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import type { RootState } from '../store/store'
import { selectWorkspaceKPIs, selectProjectProgress } from '../store/selectors'
import { fetchProjects, fetchTasks } from '../store/workspaceSlice'

/* ── Animated counter ── */
const AnimatedNumber = ({ target }: { target: number }) => {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let cur = 0
    const step = Math.max(1, Math.ceil(target / 30))
    const id = setInterval(() => {
      cur = Math.min(cur + step, target)
      setVal(cur)
      if (cur >= target) clearInterval(id)
    }, 30)
    return () => clearInterval(id)
  }, [target])
  return <>{val}</>
}

/* ── Circular ring ── */
const Ring = ({ pct, color, size = 56, stroke = 5 }: { pct: number; color: string; size?: number; stroke?: number }) => {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(30 41 59)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
    </svg>
  )
}

const velocityData = [
  { name: 'S1', points: 35, bugs: 2 },
  { name: 'S2', points: 42, bugs: 4 },
  { name: 'S3', points: 38, bugs: 1 },
  { name: 'S4', points: 50, bugs: 3 },
  { name: 'S5', points: 48, bugs: 2 },
  { name: 'S6', points: 55, bugs: 5 },
]

const weeklyActivity = [
  { day: 'Mon', commits: 8, tasks: 5 },
  { day: 'Tue', commits: 12, tasks: 7 },
  { day: 'Wed', commits: 6, tasks: 9 },
  { day: 'Thu', commits: 15, tasks: 11 },
  { day: 'Fri', commits: 10, tasks: 6 },
  { day: 'Sat', commits: 3, tasks: 2 },
  { day: 'Sun', commits: 1, tasks: 1 },
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, type: 'spring' as const, stiffness: 120, damping: 16 }
  }),
}

const TT_STYLE = {
  backgroundColor: '#0a0e1e',
  borderColor: 'rgb(51 65 85/0.6)',
  borderRadius: '12px',
  color: '#fff',
  border: '1px solid rgb(51 65 85/0.6)',
  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)',
}

export const Dashboard = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<any>()
  const user    = useSelector((s: RootState) => s.auth.user)
  const kpis    = useSelector(selectWorkspaceKPIs)
  const projPct = useSelector(selectProjectProgress)


  useEffect(() => {
    dispatch(fetchProjects()).then((action: any) => {
      if (action.payload && Array.isArray(action.payload)) {
        action.payload.forEach((p: any) => dispatch(fetchTasks(p.id)))
      }
    })
  }, [dispatch])

  const {
    activeProjects, dueTodayCount, completedTasks,
    criticalTasks, completionRate, overdueTasks,
  } = kpis

  const stats = [
    {
      label: 'Active Projects', value: activeProjects, icon: Activity,
      color: '#3b82f6', bg: 'bg-blue-500/10', ring: '#3b82f6',
      pct: Math.min(activeProjects * 25, 100), trend: '+1', up: true,
    },
    {
      label: 'Due Today', value: dueTodayCount, icon: Clock,
      color: '#f59e0b', bg: 'bg-amber-500/10', ring: '#f59e0b',
      pct: Math.min(dueTodayCount * 20, 100), trend: 'today', up: false,
    },
    {
      label: 'Completed', value: completedTasks, icon: CheckCircle2,
      color: '#10b981', bg: 'bg-emerald-500/10', ring: '#10b981',
      pct: completionRate, trend: `${completionRate}%`, up: true,
    },
    {
      label: 'Critical', value: criticalTasks, icon: AlertCircle,
      color: '#ef4444', bg: 'bg-rose-500/10', ring: '#ef4444',
      pct: Math.min(criticalTasks * 25, 100), trend: criticalTasks > 0 ? 'urgent' : 'clear', up: criticalTasks === 0,
    },
  ]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <motion.div className="space-y-5" initial="hidden" animate="visible">

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Header Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <motion.div variants={fadeUp} custom={0} className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-0.5">
            {greeting}, <span className="text-[#61dafb]">{user?.name ? user.name.split(' ')[0] : 'Developer'}</span> 👋
          </h1>

          <p className="text-slate-400 text-sm">Here's your workspace at a glance.</p>
        </div>
        <motion.button
          onClick={() => navigate('/ai-insights')}
          variants={fadeUp} custom={0}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer"
          style={{ background: 'linear-gradient(135deg,rgb(217 119 6/0.15),rgb(245 158 11/0.08))', border: '1px solid rgb(245 158 11/0.2)', color: '#f59e0b' }}
        >
          <Sparkles className="w-4 h-4" />
          Generate AI Standup
        </motion.button>

      </motion.div>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Stat Cards Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div
              key={i}
              variants={fadeUp}
              custom={i + 1}
              whileHover={{ y: -3, transition: { type: 'spring' as const, stiffness: 400 } }}
              className="relative rounded-2xl p-5 overflow-hidden cursor-pointer"
              style={{
                background: 'linear-gradient(135deg,rgb(10 14 30/0.9),rgb(15 23 42/0.7))',
                border: `1px solid rgb(51 65 85/0.4)`,
                backdropFilter: 'blur(12px)',
              }}
            >
              {/* Glow in corner */}
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-20 blur-2xl"
                style={{ background: s.color }} />

              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${s.bg} border border-current/10`} style={{ color: s.color }}>
                  <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
                </div>
                {/* Ring */}
                <div className="relative">
                  <Ring pct={s.pct} color={s.ring} size={48} stroke={4} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-white">{s.pct}%</span>
                  </div>
                </div>
              </div>

              <p className="text-3xl font-black text-white mb-0.5">
                <AnimatedNumber target={s.value} />
              </p>
              <p className="text-xs text-slate-400 mb-2">{s.label}</p>

              <div className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${s.up ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
                {s.up && <ArrowUp className="w-2.5 h-2.5" />}
                {s.trend}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Charts row Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Velocity area chart */}
        <motion.div variants={fadeUp} custom={5} className="lg:col-span-2 rounded-2xl p-5 overflow-hidden"
          style={{ background: 'linear-gradient(135deg,rgb(10 14 30/0.9),rgb(15 23 42/0.7))', border: '1px solid rgb(51 65 85/0.4)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#61dafb]" /> Team Velocity
            </h3>
            <div className="flex gap-3 text-[10px] text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#61dafb] inline-block" />Points</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />Bugs</span>
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="gPoints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#61dafb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#61dafb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gBugs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(51 65 85/0.3)" vertical={false} />
                <XAxis dataKey="name" stroke="#475569" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TT_STYLE} />
                <Area type="monotone" dataKey="points" stroke="#61dafb" strokeWidth={2.5} fill="url(#gPoints)" dot={{ fill: '#61dafb', r: 3, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="bugs"   stroke="#ef4444" strokeWidth={2} fill="url(#gBugs)" dot={{ fill: '#ef4444', r: 3, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* AI Insights side panel */}
        <motion.div variants={fadeUp} custom={6} className="rounded-2xl p-5 flex flex-col relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,rgb(10 14 30/0.9),rgb(15 23 42/0.7))', border: '1px solid rgb(51 65 85/0.4)' }}>
          <div className="absolute top-0 left-0 w-full h-1 rounded-t-2xl" style={{ background: 'linear-gradient(90deg,#61dafb,#4f46e5)' }} />

          <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-amber-400" /> AI Workspace Insights
          </h3>

          <div className="space-y-3 flex-1">
            {overdueTasks.length > 0 ? (
              <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5">
                <div className="flex items-center gap-2 mb-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-xs font-semibold text-white">Overdue Tasks</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  <span className="text-rose-400 font-semibold">{overdueTasks.length} task(s)</span> overdue.
                  Priority: <span className="font-mono text-[#61dafb] text-[10px] bg-primary-900/20 px-1 rounded">{overdueTasks[0].key}</span>
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                <div className="flex items-center gap-2 mb-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-semibold text-white">On Track</span>
                </div>
                <p className="text-[11px] text-slate-400">No overdue tasks. All timelines are healthy 🎉</p>

              </div>
            )}

            {criticalTasks > 0 ? (
              <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5">
                <div className="flex items-center gap-2 mb-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-semibold text-white">Critical Bottleneck</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  <span className="font-mono text-[10px] text-amber-400 bg-amber-950/30 px-1 rounded">
                    {criticalTasks} task{criticalTasks > 1 ? 's' : ''}
                  </span> at CRITICAL priority Ã¢â‚¬â€ needs immediate attention.
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl border border-slate-700/50 bg-slate-800/20">
                <div className="flex items-center gap-2 mb-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#61dafb]" />
                  <span className="text-xs font-semibold text-white">Velocity Stable</span>
                </div>
                <p className="text-[11px] text-slate-400">{completedTasks} tasks done. Avg ~48 pts/sprint.</p>
              </div>
            )}

            {/* In-progress mini bar */}
            <div className="p-3.5 rounded-xl border border-slate-700/40 bg-slate-800/20">
              <div className="flex justify-between text-[10px] text-slate-400 mb-1.5">
                <span>In Progress</span>
                <span className="font-semibold text-white">{kpis.inProgress}/{kpis.totalTasks}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${kpis.totalTasks > 0 ? (kpis.inProgress / kpis.totalTasks) * 100 : 0}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg,#61dafb,#4f46e5)' }}
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/ai-insights')}
            className="mt-3 w-full py-2 rounded-xl text-xs font-semibold text-[#61dafb] hover:text-white transition-all border border-slate-700 hover:border-[#61dafb]/40 hover:bg-[#61dafb]/10 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            View Full Report →
          </button>

        </motion.div>
      </div>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Weekly Activity Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <motion.div variants={fadeUp} custom={7} className="rounded-2xl p-5"
        style={{ background: 'linear-gradient(135deg,rgb(10 14 30/0.9),rgb(15 23 42/0.7))', border: '1px solid rgb(51 65 85/0.4)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" /> This Week's Activity
          </h3>
          <div className="flex gap-3 text-[10px] text-slate-400">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />Commits</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />Tasks</span>
          </div>
        </div>
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyActivity} margin={{ top: 5, right: 5, left: -25, bottom: 0 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(51 65 85/0.3)" vertical={false} />
              <XAxis dataKey="day" stroke="#475569" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#475569" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TT_STYLE} />
              <Bar dataKey="commits" fill="#818cf8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="tasks"   fill="#34d399" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Project Progress Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <motion.div variants={fadeUp} custom={8} className="rounded-2xl p-5"
        style={{ background: 'linear-gradient(135deg,rgb(10 14 30/0.9),rgb(15 23 42/0.7))', border: '1px solid rgb(51 65 85/0.4)' }}>
        <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Project Progress
        </h3>
        <div className="space-y-4">
          {projPct.map((proj) => {
            const sColor = proj.status === 'ACTIVE' ? '#10b981' : proj.status === 'PLANNING' ? '#f59e0b' : '#3b82f6'
            return (
              <div key={proj.id}>
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{proj.name}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ color: sColor, background: `${sColor}18` }}>{proj.status}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{proj.pct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${proj.pct}%` }}
                    transition={{ duration: 1.1, delay: 0.3, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg,${sColor}cc,${sColor})` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>{proj.doneCount} completed</span>
                  <span>{proj.taskCount - proj.doneCount} remaining</span>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

    </motion.div>
  )
}
