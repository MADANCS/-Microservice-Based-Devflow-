import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import {
  X, Clock, Flag, Calendar, User, MessageSquare, Tag,
  CheckCircle2, Play, Eye, Circle, Trash2, Edit3, Plus, Timer
} from 'lucide-react'
import type { RootState } from '../store/store'
import { setActivePanelTaskId, addTimeLog } from '../store/sprintSlice'
import { updateTask, deleteTask } from '../store/workspaceSlice'
import { pushToast } from '../store/notificationSlice'

const PRIORITY_META = {
  LOW: { label: 'Low', color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20' },
  MEDIUM: { label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  HIGH: { label: 'High', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
  CRITICAL: { label: 'Critical', color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20' },
}

const STATUS_META = {
  TODO: { label: 'To Do', icon: Circle, color: 'text-slate-400' },
  IN_PROGRESS: { label: 'In Progress', icon: Play, color: 'text-blue-400' },
  IN_REVIEW: { label: 'In Review', icon: Eye, color: 'text-amber-400' },
  DONE: { label: 'Done', icon: CheckCircle2, color: 'text-emerald-400' },
}

const STATUSES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as const
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const

const fakeComments = [
  { id: 'c1', author: 'Sarah', avatar: 'S', gradient: 'from-rose-500 to-pink-600', text: 'I have started the Figma wireframes. Will share a preview by EOD.', time: '2h ago' },
  { id: 'c2', author: 'Alex', avatar: 'A', gradient: 'from-blue-600 to-indigo-600', text: 'Sounds great! Make sure to follow the design system tokens.', time: '1h ago' },
  { id: 'c3', author: 'Mike', avatar: 'M', gradient: 'from-emerald-500 to-teal-600', text: 'Backend API endpoint is ready whenever the design is finalized.', time: '30m ago' },
]

export const TaskDetailPanel = () => {
  const dispatch = useDispatch<any>()
  const activePanelTaskId = useSelector((s: RootState) => s.sprint.activePanelTaskId)
  const tasks = useSelector((s: RootState) => s.workspace.tasks)
  const timeLogs = useSelector((s: RootState) => s.sprint.timeLogs)
  const [newComment, setNewComment] = useState('')
  const [logHours, setLogHours] = useState('')
  const [logDesc, setLogDesc] = useState('')
  const [showTimeForm, setShowTimeForm] = useState(false)

  const task = tasks.find(t => t.id === activePanelTaskId)
  const taskLogs = timeLogs.filter(l => l.taskId === activePanelTaskId)
  const totalLogged = taskLogs.reduce((s, l) => s + l.hours, 0)

  const close = () => dispatch(setActivePanelTaskId(null))

  const handleStatusChange = (status: typeof STATUSES[number]) => {
    if (!task) return
    dispatch(updateTask({ ...task, status }))
    dispatch(pushToast({ type: 'success', title: 'Status Updated', message: `"${task.content}" moved to ${STATUS_META[status].label}` }))
  }

  const handlePriorityChange = (priority: typeof PRIORITIES[number]) => {
    if (!task) return
    dispatch(updateTask({ ...task, priority }))
  }

  const handleLogTime = () => {
    if (!task || !logHours) return
    dispatch(addTimeLog({
      taskId: task.id,
      memberId: 'member-1',
      hours: parseFloat(logHours),
      description: logDesc || 'Time logged',
      loggedAt: new Date().toISOString(),
    }))
    dispatch(pushToast({ type: 'success', title: 'Time Logged', message: `${logHours}h logged to ${task.key}` }))
    setLogHours('')
    setLogDesc('')
    setShowTimeForm(false)
  }

  const handleDelete = () => {
    if (!task) return
    dispatch(deleteTask(task.id))
    dispatch(pushToast({ type: 'info', title: 'Task Deleted', message: `${task.key} has been removed.` }))
    close()
  }

  return (
    <AnimatePresence>
      {activePanelTaskId && task && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-40 bg-dark-950/60 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring' as const, damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-xl bg-dark-900/98 backdrop-blur-xl border-l border-dark-700 flex flex-col shadow-2xl shadow-black/60"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-dark-800">
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-primary-400 bg-primary-900/30 px-2 py-0.5 rounded border border-primary-500/20">{task.key}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${PRIORITY_META[task.priority].bg} ${PRIORITY_META[task.priority].color} ${PRIORITY_META[task.priority].border}`}>
                    {PRIORITY_META[task.priority].label}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white leading-snug">{task.content}</h2>
              </div>
              <button onClick={close} className="p-2 rounded-xl text-dark-400 hover:text-white hover:bg-dark-800 transition-colors flex-shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* Status Switcher */}
              <div>
                <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2 block">Status</label>
                <div className="grid grid-cols-4 gap-2">
                  {STATUSES.map(s => {
                    const meta = STATUS_META[s]
                    const Icon = meta.icon
                    const active = task.status === s
                    return (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(s)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                          active
                            ? `bg-primary-500/15 border-primary-500/40 ${meta.color}`
                            : 'bg-dark-800/50 border-dark-700 text-dark-400 hover:border-dark-600 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {meta.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Flag, label: 'Priority', value: task.priority },
                  { icon: Tag, label: 'Points', value: `${task.points} SP` },
                  { icon: Calendar, label: 'Due Date', value: task.dueDate },
                  { icon: MessageSquare, label: 'Comments', value: `${fakeComments.length}` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-dark-800/40 rounded-xl p-3 border border-dark-700/50">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="w-3.5 h-3.5 text-dark-400" />
                      <span className="text-[10px] font-semibold text-dark-400 uppercase tracking-wider">{label}</span>
                    </div>
                    <p className="text-sm font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2 block">Description</label>
                <div className="bg-dark-800/40 rounded-xl p-4 border border-dark-700/50 text-sm text-dark-200 leading-relaxed">
                  {task.description || 'No description provided.'}
                </div>
              </div>

              {/* Time Tracking */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Timer className="w-3.5 h-3.5" /> Time Tracking
                  </label>
                  <button
                    onClick={() => setShowTimeForm(!showTimeForm)}
                    className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Log Time
                  </button>
                </div>
                <div className="bg-dark-800/40 rounded-xl p-4 border border-dark-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-white font-bold">{totalLogged}h logged</span>
                    <span className="text-xs text-dark-400">{taskLogs.length} entries</span>
                  </div>
                  <div className="w-full h-1.5 bg-dark-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all"
                      style={{ width: `${Math.min((totalLogged / (task.points * 2)) * 100, 100)}%` }}
                    />
                  </div>
                  {taskLogs.map(log => (
                    <div key={log.id} className="flex items-center justify-between mt-2 text-xs text-dark-300">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-dark-500" />
                        {log.description}
                      </span>
                      <span className="text-primary-400 font-semibold">{log.hours}h</span>
                    </div>
                  ))}
                  <AnimatePresence>
                    {showTimeForm && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 pt-3 border-t border-dark-700 space-y-2">
                          <input
                            type="number"
                            value={logHours}
                            onChange={e => setLogHours(e.target.value)}
                            placeholder="Hours (e.g. 1.5)"
                            className="input-field text-sm py-2"
                          />
                          <input
                            type="text"
                            value={logDesc}
                            onChange={e => setLogDesc(e.target.value)}
                            placeholder="Description (optional)"
                            className="input-field text-sm py-2"
                          />
                          <button onClick={handleLogTime} className="btn-primary w-full py-2 text-sm">
                            Save Log
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Priority Selector */}
              <div>
                <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2 block">Change Priority</label>
                <div className="flex gap-2 flex-wrap">
                  {PRIORITIES.map(p => {
                    const meta = PRIORITY_META[p]
                    return (
                      <button
                        key={p}
                        onClick={() => handlePriorityChange(p)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          task.priority === p
                            ? `${meta.bg} ${meta.color} ${meta.border}`
                            : 'bg-dark-800 border-dark-700 text-dark-400 hover:border-dark-600'
                        }`}
                      >
                        {meta.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Comments */}
              <div>
                <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3 block flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> Comments ({fakeComments.length})
                </label>
                <div className="space-y-3 mb-3">
                  {fakeComments.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${comment.gradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                        {comment.avatar}
                      </div>
                      <div className="flex-1 bg-dark-800/50 rounded-xl p-3 border border-dark-700/40">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-white">{comment.author}</span>
                          <span className="text-[10px] text-dark-500">{comment.time}</span>
                        </div>
                        <p className="text-xs text-dark-300 leading-relaxed">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">A</div>
                  <div className="flex-1 flex gap-2">
                    <input
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="input-field text-sm py-2 flex-1"
                      onKeyDown={e => { if (e.key === 'Enter' && newComment.trim()) { dispatch(pushToast({ type: 'success', title: 'Comment Added', message: 'Your comment was posted.' })); setNewComment('') } }}
                    />
                    <button
                      onClick={() => { if (newComment.trim()) { dispatch(pushToast({ type: 'success', title: 'Comment Added', message: 'Your comment was posted.' })); setNewComment('') } }}
                      className="btn-primary px-3 py-2 text-sm"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-dark-800 flex items-center justify-between">
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4" /> Delete Task
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dark-700 text-dark-300 hover:bg-dark-800 hover:text-white transition-colors text-sm">
                <Edit3 className="w-4 h-4" /> Edit Task
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
