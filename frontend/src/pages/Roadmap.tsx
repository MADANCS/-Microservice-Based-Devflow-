import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import type { RootState } from '../store/store'
import { Map, ChevronLeft, ChevronRight, Circle, CheckCircle2, Clock } from 'lucide-react'

const fade = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const STATUS_COLOR: Record<string, string> = {
  ACTIVE:    'from-primary-600 to-indigo-500',
  PLANNING:  'from-amber-500 to-orange-500',
  COMPLETED: 'from-emerald-600 to-teal-500',
}

const STATUS_ICON: Record<string, typeof Circle> = {
  ACTIVE: Clock, PLANNING: Circle, COMPLETED: CheckCircle2,
}

// Grid spans: year starts Jan = col 1, each month = 1 col
const monthIndex = (dateStr: string) => new Date(dateStr).getMonth() // 0-based

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

export const Roadmap = () => {
  const { projects, tasks } = useSelector((s: RootState) => s.workspace)
  const { sprints } = useSelector((s: RootState) => s.sprint)
  const [year, setYear] = useState(2026)

  const milestones = [
    { label: 'MVP Launch',   date: '2026-06-30', color: 'bg-primary-500' },
    { label: 'Public Beta',  date: '2026-07-15', color: 'bg-amber-500' },
    { label: 'GA Release',   date: '2026-09-01', color: 'bg-emerald-500' },
    { label: 'v2 Kickoff',   date: '2026-10-01', color: 'bg-purple-500' },
  ]

  const rows = [
    ...projects.map(p => ({
      id: p.id, label: p.name, key: p.key,
      start: p.startDate, end: p.endDate,
      status: p.status,
      tasks: tasks.filter(t => t.projectId === p.id).length,
      done: tasks.filter(t => t.projectId === p.id && t.status === 'DONE').length,
    })),
    ...sprints.map(s => ({
      id: s.id, label: s.name, key: s.goal.slice(0, 28) + 'Ã¢â‚¬Â¦',
      start: s.startDate, end: s.endDate,
      status: s.status === 'ACTIVE' ? 'ACTIVE' : s.status === 'COMPLETED' ? 'COMPLETED' : 'PLANNING',
      tasks: s.taskIds.length, done: 0,
    })),
  ]

  const today = new Date()
  const todayMonthFrac = today.getMonth() + today.getDate() / 31 // 0-based fractional

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={fade} custom={0} initial="hidden" animate="visible" className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="p-2 bg-purple-500/15 text-purple-400 rounded-xl border border-purple-500/30"><Map className="w-6 h-6" /></span>
            Roadmap
          </h1>
          <p className="text-dark-300 mt-1">Visual timeline of projects, sprints and milestones.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setYear(y => y - 1)} className="p-2 rounded-xl border border-dark-700 text-dark-300 hover:text-white hover:border-dark-600 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-4 py-2 rounded-xl bg-dark-800 border border-dark-700 text-white font-semibold text-sm min-w-[64px] text-center">{year}</span>
          <button onClick={() => setYear(y => y + 1)} className="p-2 rounded-xl border border-dark-700 text-dark-300 hover:text-white hover:border-dark-600 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Legend */}
      <motion.div variants={fade} custom={1} initial="hidden" animate="visible" className="flex gap-4 flex-wrap">
        {[
          { label: 'Active',    color: 'from-primary-600 to-indigo-500' },
          { label: 'Planning',  color: 'from-amber-500 to-orange-500' },
          { label: 'Completed', color: 'from-emerald-600 to-teal-500' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-2 text-xs text-dark-300">
            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${l.color}`} />
            {l.label}
          </div>
        ))}
        <div className="flex items-center gap-2 text-xs text-dark-300 ml-2">
          <div className="w-px h-3 bg-amber-400" />
          Milestone
        </div>
        <div className="flex items-center gap-2 text-xs text-dark-300">
          <div className="w-px h-3 bg-rose-400 border-dashed border-r" />
          Today
        </div>
      </motion.div>

      {/* Timeline Grid */}
      <motion.div variants={fade} custom={2} initial="hidden" animate="visible" className="glass-card overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Month Header */}
          <div className="grid border-b border-dark-800" style={{ gridTemplateColumns: '200px repeat(12, 1fr)' }}>
            <div className="px-4 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wider">Timeline</div>
            {MONTHS.map(m => (
              <div key={m} className="px-2 py-3 text-center text-xs font-semibold text-dark-400 border-l border-dark-800/50">
                {m}
              </div>
            ))}
          </div>

          {/* Rows */}
          {rows.map((row, rowIdx) => {
            const startM = clamp(monthIndex(row.start), 0, 11)
            const endM   = clamp(monthIndex(row.end), 0, 11)
            const StatusIcon = STATUS_ICON[row.status] ?? Circle
            const pct = row.tasks > 0 ? Math.round((row.done / row.tasks) * 100) : 0

            return (
              <motion.div
                key={row.id}
                variants={fade}
                custom={rowIdx + 3}
                initial="hidden"
                animate="visible"
                className="grid border-b border-dark-800/50 hover:bg-dark-800/20 transition-colors group"
                style={{ gridTemplateColumns: '200px repeat(12, 1fr)' }}
              >
                {/* Label */}
                <div className="px-4 py-4 flex flex-col justify-center border-r border-dark-800/50">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`w-3.5 h-3.5 flex-shrink-0 ${
                      row.status === 'ACTIVE' ? 'text-primary-400' : row.status === 'COMPLETED' ? 'text-emerald-400' : 'text-amber-400'
                    }`} />
                    <span className="text-sm font-semibold text-white truncate">{row.label}</span>
                  </div>
                  <span className="text-[10px] text-dark-500 ml-5 truncate">{row.key}</span>
                </div>

                {/* Cells */}
                {MONTHS.map((_, mIdx) => {
                  const isBar = mIdx >= startM && mIdx <= endM
                  const isStart = mIdx === startM
                  const isEnd   = mIdx === endM
                  const isTodayCol = mIdx === Math.floor(todayMonthFrac) && year === today.getFullYear()

                  return (
                    <div
                      key={mIdx}
                      className="relative px-0.5 py-3 border-l border-dark-800/30 flex items-center"
                    >
                      {/* Today line */}
                      {isTodayCol && (
                        <div
                          className="absolute top-0 bottom-0 w-px bg-rose-400/60 z-10"
                          style={{ left: `${((today.getDate() / 31) * 100).toFixed(1)}%` }}
                        />
                      )}
                      {isBar && (
                        <motion.div
                          initial={{ scaleX: 0, opacity: 0 }}
                          animate={{ scaleX: 1, opacity: 1 }}
                          transition={{ duration: 0.6, delay: rowIdx * 0.08, ease: 'easeOut' }}
                          style={{ transformOrigin: 'left' }}
                          className={`w-full h-6 rounded-full bg-gradient-to-r ${STATUS_COLOR[row.status] ?? 'from-dark-600 to-dark-500'} ${isStart ? 'rounded-l-full' : 'rounded-l-none'} ${isEnd ? 'rounded-r-full' : 'rounded-r-none'} relative overflow-hidden flex items-center px-2`}
                        >
                          {/* Progress overlay */}
                          <div className="absolute inset-0 bg-black/30 rounded-full" style={{ left: `${pct}%` }} />
                          {isStart && (
                            <span className="text-[9px] font-bold text-white/90 relative z-10 truncate">
                              {pct}%
                            </span>
                          )}
                        </motion.div>
                      )}
                    </div>
                  )
                })}
              </motion.div>
            )
          })}

          {/* Milestones Row */}
          <div className="grid" style={{ gridTemplateColumns: '200px repeat(12, 1fr)' }}>
            <div className="px-4 py-3 text-xs font-semibold text-dark-400 uppercase tracking-wider border-r border-dark-800/50">Milestones</div>
            {MONTHS.map((_, mIdx) => {
              const mileHere = milestones.filter(ms => monthIndex(ms.date) === mIdx)
              return (
                <div key={mIdx} className="relative px-1 py-3 border-l border-dark-800/30 flex items-center gap-1 flex-wrap">
                  {mileHere.map(ms => (
                    <div key={ms.label} className="group/ms relative">
                      <div className={`w-2.5 h-2.5 rounded-full ${ms.color} cursor-pointer hover:scale-150 transition-transform`} />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-dark-800 border border-dark-700 rounded-lg text-[10px] text-white whitespace-nowrap opacity-0 group-hover/ms:opacity-100 transition-opacity pointer-events-none z-20">
                        {ms.label}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
