import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../store/store'
import { addSprint, updateSprint, completeSprint, type Sprint } from '../store/sprintSlice'
import { pushToast } from '../store/notificationSlice'
import {
  Zap, Plus, CheckCircle2, Play, Circle, XCircle,
  Target, Calendar, ChevronDown, ChevronUp, Flag, Edit, Save, X, Trash2
} from 'lucide-react'

const fade = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, type: 'spring' as const, stiffness: 110 } }),
}

const STATUS_META: Record<Sprint['status'], { label: string; icon: typeof Circle; color: string; bg: string; border: string }> = {
  ACTIVE:    { label: 'Active',    icon: Play,         color: 'text-primary-400', bg: 'bg-primary-500/10', border: 'border-primary-500/25' },
  PLANNED:   { label: 'Planned',   icon: Circle,       color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/25' },
  COMPLETED: { label: 'Completed', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25' },
  CANCELLED: { label: 'Cancelled', icon: XCircle,      color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/25' },
}

const EMPTY_FORM = { name: '', goal: '', projectId: '', startDate: '', endDate: '', taskIds: [] as string[] }

export const SprintPlanning = () => {
  const dispatch = useDispatch<any>()
  const { sprints } = useSelector((s: RootState) => s.sprint)
  const { projects, tasks } = useSelector((s: RootState) => s.workspace)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'ALL' | Sprint['status']>('ALL')

  const filtered = sprints.filter(s => filterStatus === 'ALL' || s.status === filterStatus)

  const handleCreate = () => {
    if (!form.name || !form.projectId || !form.startDate || !form.endDate) {
      dispatch(pushToast({ type: 'error', title: 'Validation Error', message: 'Please fill all required fields.' }))
      return
    }
    dispatch(addSprint({ ...form, status: 'PLANNED', sprintNumber: sprints.length + 1, plannedPoints: 0, completedPoints: 0 }))
    dispatch(pushToast({ type: 'success', title: 'Sprint Created', message: `"${form.name}" is ready for planning.` }))
    setForm(EMPTY_FORM)
    setShowForm(false)
  }

  const [managingSprintId, setManagingSprintId] = useState<string | null>(null)
  const [managedTaskIds, setManagedTaskIds] = useState<string[]>([])

  const openManageBacklog = (sprint: Sprint) => {
    setManagingSprintId(sprint.id)
    setManagedTaskIds(sprint.taskIds)
  }

  const saveBacklog = (sprint: Sprint) => {
    dispatch(updateSprint({ ...sprint, taskIds: managedTaskIds }))
    setManagingSprintId(null)
    dispatch(pushToast({ type: 'success', title: 'Backlog Updated', message: `Tasks updated for ${sprint.name}.` }))
  }

  const handleStartSprint = (sprint: Sprint) => {
    dispatch(updateSprint({ ...sprint, status: 'ACTIVE' }))
    dispatch(pushToast({ type: 'success', title: 'Sprint Started', message: `"${sprint.name}" is now active.` }))
  }

  const handleCancelSprint = (sprint: Sprint) => {
    dispatch(updateSprint({ ...sprint, status: 'CANCELLED' }))
    dispatch(pushToast({ type: 'info', title: 'Sprint Cancelled', message: `"${sprint.name}" has been cancelled.` }))
  }

  const handleComplete = (id: string, name: string) => {
    dispatch(completeSprint(id))
    dispatch(pushToast({ type: 'success', title: 'Sprint Completed', message: `"${name}" has been marked as complete.` }))
  }

  const sprintProgress = (sprint: Sprint) => {
    const sprintTasks = tasks.filter(t => sprint.taskIds.includes(t.id))
    const done = sprintTasks.filter(t => t.status === 'DONE').length
    return { total: sprintTasks.length, done, pct: sprintTasks.length > 0 ? Math.round((done / sprintTasks.length) * 100) : 0 }
  }

  const daysLeft = (endDate: string) => {
    const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000)
    return diff > 0 ? `${diff}d left` : diff === 0 ? 'Ends today' : `${Math.abs(diff)}d ago`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={fade} custom={0} initial="hidden" animate="visible" className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="p-2 bg-primary-500/15 text-primary-400 rounded-xl border border-primary-500/30"><Zap className="w-6 h-6" /></span>
            Sprint Planning
          </h1>
          <p className="text-dark-300 mt-1">Create, manage and track your agile sprints.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Sprint
        </button>
      </motion.div>

      {/* Create Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-6 border border-primary-500/20 space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2"><Plus className="w-5 h-5 text-primary-400" /> Create Sprint</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-1.5 block">Sprint Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Sprint 7" className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-1.5 block">Project *</label>
                  <select value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))} className="input-field">
                    <option value="">Select projectÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-1.5 block">Start Date *</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-1.5 block">End Date *</label>
                  <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="input-field" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-1.5 block">Sprint Goal</label>
                  <input value={form.goal} onChange={e => setForm(f => ({ ...f, goal: e.target.value }))} placeholder="What should the team achieve this sprint?" className="input-field" />
                </div>
                {form.projectId && (
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-1.5 block">Initial Sprint Backlog</label>
                    <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 bg-dark-900/40 p-3 rounded-xl border border-dark-800">
                      {tasks.filter(t => t.projectId === form.projectId).length === 0 && (
                        <p className="text-sm text-dark-400 italic">No tasks available for this project.</p>
                      )}
                      {tasks.filter(t => t.projectId === form.projectId).map(task => (
                        <label key={task.id} className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-dark-800 transition-colors">
                          <input type="checkbox" className="accent-primary-500" checked={form.taskIds.includes(task.id)} onChange={(e) => {
                            if (e.target.checked) setForm(f => ({ ...f, taskIds: [...f.taskIds, task.id] }))
                            else setForm(f => ({ ...f, taskIds: f.taskIds.filter(id => id !== task.id) }))
                          }} />
                          <span className="text-xs font-mono bg-dark-800 px-1.5 rounded">{task.key}</span>
                          <span className="text-sm text-white flex-1 truncate">{task.content}</span>
                          <span className="text-xs text-dark-400">{task.points} SP</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }} className="btn-secondary">Cancel</button>
                <button onClick={handleCreate} className="btn-primary">Create Sprint</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <motion.div variants={fade} custom={1} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Sprints',  value: sprints.length,                                      color: 'text-white' },
          { label: 'Active',         value: sprints.filter(s => s.status === 'ACTIVE').length,    color: 'text-primary-400' },
          { label: 'Completed',      value: sprints.filter(s => s.status === 'COMPLETED').length, color: 'text-emerald-400' },
          { label: 'Planned',        value: sprints.filter(s => s.status === 'PLANNED').length,   color: 'text-amber-400' },
        ].map((s, i) => (
          <div key={i} className="glass-card p-4 text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-dark-400 mt-1">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Filter */}
      <motion.div variants={fade} custom={2} initial="hidden" animate="visible">
        <div className="flex gap-1 bg-dark-900/60 p-1 rounded-xl border border-dark-800 w-fit">
          {(['ALL', 'ACTIVE', 'PLANNED', 'COMPLETED', 'CANCELLED'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                filterStatus === s ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'text-dark-400 hover:text-white hover:bg-dark-800'
              }`}
            >{s === 'ALL' ? 'All' : STATUS_META[s].label}</button>
          ))}
        </div>
      </motion.div>

      {/* Sprint Cards */}
      <div className="space-y-3">
        {filtered.map((sprint, i) => {
          const meta = STATUS_META[sprint.status]
          const Icon = meta.icon
          const { total, done, pct } = sprintProgress(sprint)
          const isExpanded = expandedId === sprint.id
          const project = projects.find(p => p.id === sprint.projectId)
          const sprintTasks = tasks.filter(t => sprint.taskIds.includes(t.id))

          return (
            <motion.div key={sprint.id} variants={fade} custom={i + 3} initial="hidden" animate="visible"
              className={`glass-card border ${meta.border} overflow-hidden`}>
              {/* Sprint Header */}
              <div
                className="flex items-center gap-4 p-5 cursor-pointer hover:bg-dark-800/20 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : sprint.id)}
              >
                <div className={`p-2.5 rounded-xl ${meta.bg} ${meta.color} flex-shrink-0 border ${meta.border}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-white">{sprint.name}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${meta.bg} ${meta.color} ${meta.border}`}>{meta.label}</span>
                    {project && <span className="text-[10px] text-dark-400 bg-dark-800 border border-dark-700 px-2 py-0.5 rounded">{project.name}</span>}
                  </div>
                  {sprint.goal && (
                    <p className="text-xs text-dark-400 flex items-center gap-1 truncate">
                      <Target className="w-3 h-3 flex-shrink-0" /> {sprint.goal}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-6 flex-shrink-0">
                  <div className="hidden md:flex items-center gap-1.5 text-xs text-dark-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {sprint.startDate} ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ {sprint.endDate}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{pct}%</p>
                    <p className="text-[10px] text-dark-400">{done}/{total} tasks</p>
                  </div>
                  <div className="w-20 h-1.5 bg-dark-800 rounded-full overflow-hidden hidden md:block">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
                      className="h-full rounded-full bg-gradient-to-r from-primary-600 to-primary-400" />
                  </div>
                  <div className="text-dark-400">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 border-t border-dark-800/50 pt-4 space-y-4">
                      {/* Date & days left */}
                      <div className="flex justify-between items-center flex-wrap gap-4 text-xs text-dark-300">
                        <div className="flex gap-4 flex-wrap">
                          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-dark-400" /> {sprint.startDate} to {sprint.endDate}</span>
                          <span className={`flex items-center gap-1.5 font-semibold ${sprint.status === 'ACTIVE' ? 'text-primary-400' : 'text-dark-400'}`}>
                            <Flag className="w-3.5 h-3.5" /> {daysLeft(sprint.endDate)}
                          </span>
                        </div>
                        {sprint.status === 'PLANNED' && managingSprintId !== sprint.id && (
                          <button onClick={() => openManageBacklog(sprint)} className="flex items-center gap-1.5 text-primary-400 hover:text-primary-300 font-semibold px-2 py-1 rounded hover:bg-primary-500/10 transition-colors">
                            <Edit className="w-3.5 h-3.5" /> Manage Backlog
                          </button>
                        )}
                      </div>

                      {/* Task list in this sprint */}
                      {managingSprintId === sprint.id ? (
                        <div className="space-y-3 bg-dark-900/50 p-4 rounded-xl border border-primary-500/30">
                          <div className="flex justify-between items-center">
                            <h4 className="text-sm font-semibold text-white">Select Tasks for {sprint.name}</h4>
                            <button onClick={() => setManagingSprintId(null)} className="text-dark-400 hover:text-white p-1 hover:bg-dark-800 rounded-lg"><X className="w-4 h-4" /></button>
                          </div>
                          <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                            {tasks.filter(t => t.projectId === sprint.projectId).length === 0 && (
                              <p className="text-sm text-dark-400 italic">No tasks found for this project.</p>
                            )}
                            {tasks.filter(t => t.projectId === sprint.projectId).map(task => (
                              <label key={task.id} className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors border ${managedTaskIds.includes(task.id) ? 'bg-primary-500/10 border-primary-500/30' : 'bg-dark-800 border-dark-700 hover:bg-dark-700/50'}`}>
                                <input type="checkbox" className="mt-1 accent-primary-500" checked={managedTaskIds.includes(task.id)} onChange={(e) => {
                                  if (e.target.checked) setManagedTaskIds([...managedTaskIds, task.id])
                                  else setManagedTaskIds(managedTaskIds.filter(id => id !== task.id))
                                }} />
                                <div className="flex flex-col flex-1">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-white font-medium">{task.content}</span>
                                    <span className="text-xs text-dark-400 font-mono bg-dark-900 px-1 rounded">{task.key}</span>
                                  </div>
                                  <div className="flex gap-2 mt-1 text-[10px] text-dark-400">
                                    <span className={`px-1.5 rounded ${task.status === 'DONE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-dark-700'}`}>{task.status.replace('_', ' ')}</span>
                                    <span>{task.points} SP</span>
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                          <div className="flex justify-end pt-2">
                            <button onClick={() => saveBacklog(sprint)} className="btn-primary py-1.5 px-4 text-sm flex items-center gap-2">
                              <Save className="w-4 h-4" /> Save Backlog
                            </button>
                          </div>
                        </div>
                      ) : sprintTasks.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider">Sprint Backlog ({sprintTasks.length})</p>
                          {sprintTasks.map(task => (
                            <div key={task.id} className="flex items-center gap-3 p-3 bg-dark-800/40 rounded-xl border border-dark-700/50 hover:bg-dark-800 transition-colors cursor-default">
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${task.status === 'DONE' ? 'bg-emerald-400' : task.status === 'IN_PROGRESS' ? 'bg-blue-400' : task.status === 'IN_REVIEW' ? 'bg-amber-400' : 'bg-dark-500'}`} />
                              <span className="text-xs font-mono text-primary-400 bg-primary-900/20 px-1.5 rounded flex-shrink-0">{task.key}</span>
                              <span className="text-sm text-white flex-1 truncate">{task.content}</span>
                              <span className="text-xs text-dark-400 flex-shrink-0">{task.points} SP</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-dark-500 italic bg-dark-800/20 p-4 rounded-xl border border-dark-800/50 text-center">No tasks assigned to this sprint yet.</p>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3 pt-2">
                        {sprint.status === 'PLANNED' && (
                          <button onClick={() => handleStartSprint(sprint)} className="btn-primary text-sm px-4 py-2 flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 border-none shadow-lg shadow-emerald-500/20">
                            <Play className="w-4 h-4 fill-current" /> Start Sprint
                          </button>
                        )}
                        {sprint.status === 'ACTIVE' && (
                          <button onClick={() => handleComplete(sprint.id, sprint.name)} className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Complete Sprint
                          </button>
                        )}
                        {(sprint.status === 'PLANNED' || sprint.status === 'ACTIVE') && (
                          <button onClick={() => handleCancelSprint(sprint)} className="btn-secondary text-sm px-4 py-2 flex items-center gap-2 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30">
                            <Trash2 className="w-4 h-4" /> Cancel Sprint
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
        {filtered.length === 0 && (
          <div className="glass-card p-12 text-center text-dark-400">
            <Zap className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p>No sprints found. Create your first sprint to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}
