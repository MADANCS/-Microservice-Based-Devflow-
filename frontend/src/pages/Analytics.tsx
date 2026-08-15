import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import type { RootState } from '../store/store'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  TrendingUp, TrendingDown, Activity, CheckCircle2, AlertCircle, Clock,
  Zap, Target, Users, BarChart2, PieChart as PieChartIcon, Award, ArrowUp, ArrowDown
} from 'lucide-react'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

const sprintVelocity = [
  { sprint: 'S1', planned: 40, delivered: 35, bugs: 2 },
  { sprint: 'S2', planned: 45, delivered: 42, bugs: 4 },
  { sprint: 'S3', planned: 42, delivered: 38, bugs: 1 },
  { sprint: 'S4', planned: 50, delivered: 50, bugs: 3 },
  { sprint: 'S5', planned: 48, delivered: 48, bugs: 2 },
  { sprint: 'S6', planned: 55, delivered: 55, bugs: 5 },
]

const burndownData = [
  { day: 'Day 1', remaining: 120, ideal: 120 },
  { day: 'Day 3', remaining: 108, ideal: 100 },
  { day: 'Day 5', remaining: 90, ideal: 80 },
  { day: 'Day 7', remaining: 75, ideal: 60 },
  { day: 'Day 9', remaining: 55, ideal: 40 },
  { day: 'Day 11', remaining: 30, ideal: 20 },
  { day: 'Day 13', remaining: 12, ideal: 0 },
]

const activityFeed = [
  { id: 1, user: 'Alex', action: 'moved', target: 'DEVF-43', detail: 'to In Progress', time: '2m ago', type: 'task', avatar: 'A' },
  { id: 2, user: 'Sarah', action: 'completed', target: 'DEVF-41', detail: 'Setup Redis Rate Limiter', time: '15m ago', type: 'done', avatar: 'S' },
  { id: 3, user: 'Mike', action: 'commented on', target: 'DEVF-42', detail: 'Design new landing page', time: '1h ago', type: 'comment', avatar: 'M' },
  { id: 4, user: 'Alex', action: 'created', target: 'DEVF-44', detail: 'Fix Safari flexbox bug', time: '2h ago', type: 'create', avatar: 'A' },
  { id: 5, user: 'Sarah', action: 'updated priority of', target: 'MKT-2', detail: 'to HIGH', time: '3h ago', type: 'update', avatar: 'S' },
  { id: 6, user: 'Mike', action: 'completed', target: 'MKT-1', detail: 'Competitor Brand Analysis', time: '5h ago', type: 'done', avatar: 'M' },
  { id: 7, user: 'Alex', action: 'started sprint', target: 'Sprint 6', detail: 'DevFlow Core', time: '1d ago', type: 'sprint', avatar: 'A' },
  { id: 8, user: 'Sarah', action: 'created project', target: 'Marketing Site Redesign', detail: '', time: '2d ago', type: 'create', avatar: 'S' },
]

const teamRadar = [
  { subject: 'Velocity', A: 85, B: 70, fullMark: 100 },
  { subject: 'Quality', A: 90, B: 80, fullMark: 100 },
  { subject: 'Delivery', A: 78, B: 85, fullMark: 100 },
  { subject: 'Planning', A: 88, B: 72, fullMark: 100 },
  { subject: 'Collab', A: 92, B: 88, fullMark: 100 },
]

const activityTypeColors: Record<string, string> = {
  task: 'bg-blue-500/20 text-blue-400',
  done: 'bg-emerald-500/20 text-emerald-400',
  comment: 'bg-purple-500/20 text-purple-400',
  create: 'bg-amber-500/20 text-amber-400',
  update: 'bg-orange-500/20 text-orange-400',
  sprint: 'bg-primary-500/20 text-primary-400',
}

const avatarColors: Record<string, string> = {
  A: 'from-blue-600 to-indigo-600',
  S: 'from-rose-500 to-pink-600',
  M: 'from-emerald-500 to-teal-600',
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, type: 'spring' as const, stiffness: 120 } })
}

export const Analytics = () => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const workspace = useSelector((state: RootState) => state.workspace)
  const projects = Array.isArray(workspace?.projects) ? workspace.projects : []
  const tasks = Array.isArray(workspace?.tasks) ? workspace.tasks : []
  const [activeTab, setActiveTab] = useState<'overview' | 'velocity' | 'burndown' | 'team'>('overview')

  const totalTasks = tasks.length
  const doneTasks = tasks.filter(t => t?.status === 'DONE').length
  const inProgressTasks = tasks.filter(t => t?.status === 'IN_PROGRESS').length
  const overdueTasks = tasks.filter(t => (t?.dueDate || '') < '2026-06-14' && t?.status !== 'DONE').length
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
  const avgVelocity = Math.round(sprintVelocity.reduce((s, v) => s + v.delivered, 0) / sprintVelocity.length)

  const priorityDist = useMemo(() => {
    const list = [
      { name: 'Critical', value: tasks.filter(t => t?.priority === 'CRITICAL').length },
      { name: 'High', value: tasks.filter(t => t?.priority === 'HIGH').length },
      { name: 'Medium', value: tasks.filter(t => t?.priority === 'MEDIUM').length },
      { name: 'Low', value: tasks.filter(t => t?.priority === 'LOW').length },
    ].filter(d => d.value > 0)
    return list.length > 0 ? list : [{ name: 'Tasks', value: 1 }]
  }, [tasks])

  const statCards = [
    { label: 'Completion Rate', value: `${completionRate}%`, sub: `${doneTasks}/${totalTasks} tasks`, icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-400/10', trend: '+8%', up: true },
    { label: 'Avg Velocity', value: `${avgVelocity} pts`, sub: 'Per sprint', icon: Zap, color: 'text-blue-400', bg: 'bg-blue-400/10', trend: '+12%', up: true },
    { label: 'Active Projects', value: projects.filter(p => p.status === 'ACTIVE').length.toString(), sub: `${projects.length} total`, icon: Activity, color: 'text-purple-400', bg: 'bg-purple-400/10', trend: '0%', up: true },
    { label: 'Overdue Tasks', value: overdueTasks.toString(), sub: 'Needs attention', icon: AlertCircle, color: 'text-rose-400', bg: 'bg-rose-400/10', trend: '-3', up: false },
  ]

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'velocity', label: 'Velocity', icon: TrendingUp },
    { id: 'burndown', label: 'Burndown', icon: Activity },
    { id: 'team', label: 'Team', icon: Users },
  ] as const

  const CustomTooltipStyle = {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderRadius: '10px',
    color: '#fff',
    border: '1px solid #334155',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.4)',
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <motion.div variants={fadeUp} custom={0} initial="hidden" animate="visible"
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="p-2 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
              <BarChart2 className="w-6 h-6" />
            </span>
            Analytics & Insights
          </h1>
          <p className="text-dark-300 mt-1">Track performance, velocity, and team activity across all projects.</p>
        </div>
        <div className="flex items-center gap-2 bg-dark-900/50 rounded-xl p-1 border border-dark-800">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                    : 'text-dark-400 hover:text-white hover:bg-dark-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div key={i} variants={fadeUp} custom={i + 1} initial="hidden" animate="visible"
              className="glass-card p-5 flex flex-col gap-3 group hover:shadow-primary-500/10">
              <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl ${card.bg} ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
                  card.up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {card.up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {card.trend}
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white group-hover:text-primary-400 transition-colors">{card.value}</p>
                <p className="text-xs text-dark-400 mt-0.5">{card.label}</p>
                <p className="text-[10px] text-dark-500 mt-1">{card.sub}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-6 min-h-0">

        {/* Charts Area */}
        <div className="xl:col-span-2 space-y-6">
          {activeTab === 'overview' && (
            <>
              <motion.div variants={fadeUp} custom={5} initial="hidden" animate="visible" className="glass-card p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-purple-400" /> Priority Distribution
                  </h3>
                  <span className="text-xs text-dark-400">{totalTasks} total tasks</span>
                </div>
                <div className="flex items-center gap-6">
                  {mounted && (
                    <ResponsiveContainer width="100%" height={180} minWidth={100} minHeight={150} debounce={50}>
                      <PieChart>
                        <Pie data={priorityDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                          {priorityDist.map((_, idx) => <Cell key={idx} fill={COLORS[idx]} />)}
                        </Pie>
                        <Tooltip contentStyle={CustomTooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                  <div className="flex flex-col gap-3 flex-1">
                    {priorityDist.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                          <span className="text-sm text-dark-300">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-dark-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${(item.value / totalTasks) * 100}%`, backgroundColor: COLORS[idx] }} />
                          </div>
                          <span className="text-sm font-bold text-white w-4 text-right">{item.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} custom={6} initial="hidden" animate="visible" className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Project Progress
                </h3>
                <div className="space-y-5">
                  {projects.map((proj) => {
                    const projTasks = tasks.filter(t => t.projectId === proj.id)
                    const done = projTasks.filter(t => t.status === 'DONE').length
                    const pct = projTasks.length > 0 ? Math.round((done / projTasks.length) * 100) : 0
                    const statusColor = proj.status === 'ACTIVE' ? 'text-emerald-400' : proj.status === 'PLANNING' ? 'text-amber-400' : 'text-blue-400'
                    return (
                      <div key={proj.id}>
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <span className="text-sm font-semibold text-white">{proj.name}</span>
                            <span className={`ml-2 text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>{proj.status}</span>
                          </div>
                          <span className="text-sm font-bold text-white">{pct}%</span>
                        </div>
                        <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                            className="h-full rounded-full bg-gradient-to-r from-primary-600 to-primary-400"
                          />
                        </div>
                        <div className="flex justify-between mt-1 text-[10px] text-dark-500">
                          <span>{done} completed</span>
                          <span>{projTasks.length - done} remaining</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            </>
          )}

          {activeTab === 'velocity' && (
            <motion.div variants={fadeUp} custom={5} initial="hidden" animate="visible" className="glass-card p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" /> Sprint Velocity
                </h3>
                <div className="flex gap-4 text-xs">
                  <span className="flex items-center gap-1 text-blue-400"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> Planned</span>
                  <span className="flex items-center gap-1 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Delivered</span>
                  <span className="flex items-center gap-1 text-rose-400"><span className="w-2 h-2 rounded-full bg-rose-400 inline-block" /> Bugs</span>
                </div>
              </div>
              {mounted && (
                <ResponsiveContainer width="100%" height={320} minWidth={100} minHeight={200} debounce={50}>
                  <BarChart data={sprintVelocity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="sprint" stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={CustomTooltipStyle} />
                    <Bar dataKey="planned" fill="#3b82f6" opacity={0.5} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="delivered" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="bugs" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-dark-800">
                {[
                  { label: 'Avg Planned', value: Math.round(sprintVelocity.reduce((s, v) => s + v.planned, 0) / sprintVelocity.length), color: 'text-blue-400' },
                  { label: 'Avg Delivered', value: avgVelocity, color: 'text-emerald-400' },
                  { label: 'Avg Bugs/Sprint', value: Math.round(sprintVelocity.reduce((s, v) => s + v.bugs, 0) / sprintVelocity.length), color: 'text-rose-400' },
                ].map((m, i) => (
                  <div key={i} className="text-center">
                    <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
                    <p className="text-xs text-dark-400 mt-1">{m.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'burndown' && (
            <motion.div variants={fadeUp} custom={5} initial="hidden" animate="visible" className="glass-card p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-amber-400" /> Sprint Burndown Chart
                </h3>
                <span className="text-xs text-dark-400 bg-dark-800 px-3 py-1 rounded-lg border border-dark-700">Sprint 6 — Active</span>
              </div>
              {mounted && (
                <ResponsiveContainer width="100%" height={320} minWidth={100} minHeight={200} debounce={50}>
                  <AreaChart data={burndownData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="remaining" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="ideal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#64748b" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="day" stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#64748b" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={CustomTooltipStyle} />
                    <Area type="monotone" dataKey="ideal" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" fill="url(#ideal)" name="Ideal" />
                    <Area type="monotone" dataKey="remaining" stroke="#3b82f6" strokeWidth={3} fill="url(#remaining)" name="Remaining" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          )}

          {activeTab === 'team' && (
            <motion.div variants={fadeUp} custom={5} initial="hidden" animate="visible" className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                <Award className="w-5 h-5 text-amber-400" /> Team Performance Radar
              </h3>
              {mounted && (
                <ResponsiveContainer width="100%" height={320} minWidth={100} minHeight={200} debounce={50}>
                  <RadarChart data={teamRadar}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Radar name="Sprint 6" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                    <Radar name="Sprint 5" dataKey="B" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} strokeWidth={2} strokeDasharray="4 4" />
                    <Tooltip contentStyle={CustomTooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-dark-800">
                {[
                  { name: 'Alex', tasks: tasks.length > 0 ? 4 : 0, done: 2, avatar: 'A' },
                  { name: 'Sarah', tasks: tasks.length > 0 ? 5 : 0, done: 3, avatar: 'S' },
                  { name: 'Mike', tasks: tasks.length > 0 ? 3 : 0, done: 1, avatar: 'M' },
                ].map((member, i) => (
                  <div key={i} className="bg-dark-900/50 rounded-xl p-3 border border-dark-800 text-center">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColors[member.avatar]} flex items-center justify-center font-bold text-white text-sm mx-auto mb-2`}>
                      {member.avatar}
                    </div>
                    <p className="text-sm font-semibold text-white">{member.name}</p>
                    <p className="text-xs text-dark-400 mt-1">{member.done}/{member.tasks} tasks</p>
                    <div className="w-full h-1.5 bg-dark-800 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full" style={{ width: `${member.tasks > 0 ? (member.done / member.tasks) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="xl:col-span-1">
          <motion.div variants={fadeUp} custom={7} initial="hidden" animate="visible"
            className="glass-card h-full flex flex-col overflow-hidden">
            <div className="p-5 border-b border-dark-800/50 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-400" /> Activity Feed
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Live" />
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activityFeed.map((item, i) => (
                <motion.div
                  key={item.id}
                  variants={fadeUp}
                  custom={i + 8}
                  initial="hidden"
                  animate="visible"
                  className="flex gap-3 p-3 rounded-xl hover:bg-dark-800/50 transition-colors group"
                >
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColors[item.avatar] || 'from-slate-600 to-slate-700'} flex items-center justify-center font-bold text-white text-xs flex-shrink-0`}>
                    {item.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-dark-200 leading-relaxed">
                      <span className="font-semibold text-white">{item.user}</span>
                      {' '}{item.action}{' '}
                      <span className="font-mono text-primary-400 bg-primary-900/20 px-1 rounded text-[10px]">{item.target}</span>
                      {item.detail && <span className="text-dark-400"> Ã¢â‚¬â€ {item.detail}</span>}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${activityTypeColors[item.type] || 'bg-dark-700 text-dark-400'}`}>
                        {item.type.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-dark-500">{item.time}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="p-4 border-t border-dark-800/50">
              <button className="w-full py-2 text-xs font-medium text-primary-400 hover:text-primary-300 hover:bg-primary-500/5 rounded-lg transition-colors border border-primary-500/20">
                View Full Activity Log
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
