import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { DragDropContext, type DropResult } from '@hello-pangea/dnd'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutGrid, List, Filter, ChevronDown, X, Plus } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../store/store'
import { updateTaskStatus, addTask } from '../../store/workspaceSlice'
import { pushToast } from '../../store/notificationSlice'
import { KanbanColumn } from './KanbanColumn'
import { KanbanColumnSkeleton } from '../Skeleton'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import type { KanbanColumn as KanbanColumnType, KanbanTask } from '../../types'
import { Priority, TaskStatus } from '../../types'
import { setActivePanelTaskId } from '../../store/sprintSlice'

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Column definitions ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
const COLUMN_DEFS: Omit<KanbanColumnType, 'tasks'>[] = [
  { id: TaskStatus.TODO,        title: 'Backlog',     wipLimit: null, color: '#94a3b8' },
  { id: TaskStatus.IN_PROGRESS, title: 'In Progress', wipLimit: 4,    color: '#61dafb' },
  { id: TaskStatus.IN_REVIEW,   title: 'In Review',   wipLimit: 3,    color: '#f59e0b' },
  { id: TaskStatus.DONE,        title: 'Done',        wipLimit: null, color: '#10b981' },
]

const COLUMN_ORDER = COLUMN_DEFS.map(c => c.id) as TaskStatus[]

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Add Task Modal ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
interface AddTaskModalProps {
  defaultColumn: TaskStatus
  projectId: string
  projects: { id: string; name: string }[]
  onSave: (data: { title: string; priority: Priority; dueDate: string; columnId: TaskStatus; projectId: string }) => void
  onClose: () => void
}
const AddTaskModal = React.memo(({ defaultColumn, projectId, projects, onSave, onClose }: AddTaskModalProps) => {
  const [title, setTitle]       = useState('')
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM)
  const [dueDate, setDueDate]   = useState('')
  const [column, setColumn]     = useState<TaskStatus>(defaultColumn)
  const [pid, setPid]           = useState(projectId)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => { titleRef.current?.focus() }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSave({ title: title.trim(), priority, dueDate, columnId: column, projectId: pid })
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-task-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: -20 }}
        transition={{ type: 'spring' as const, stiffness: 320, damping: 28 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4"
        style={{ background: 'rgb(10 14 30)', border: '1px solid rgb(51 65 85/0.5)' }}
      >
        <div className="flex items-center justify-between">
          <h3 id="add-task-title" className="text-lg font-bold text-white">New Task</h3>
          <button onClick={onClose} aria-label="Close dialog" className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="task-title" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Title *
            </label>
            <input
              id="task-title"
              ref={titleRef}
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              placeholder="What needs to be done?"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#61dafb]/50 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="task-priority" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Priority</label>
              <select
                id="task-priority"
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-[#61dafb]/50 transition-colors"
              >
                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="task-column" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Column</label>
              <select
                id="task-column"
                value={column}
                onChange={e => setColumn(e.target.value as TaskStatus)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-[#61dafb]/50 transition-colors"
              >
                {COLUMN_DEFS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="task-project" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Project</label>
              <select
                id="task-project"
                value={pid}
                onChange={e => setPid(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-[#61dafb]/50 transition-colors"
              >
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="task-due" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Due Date</label>
              <input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-[#61dafb]/50 transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5)' }}
            >
              <Plus className="w-4 h-4" /> Create Task
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
})
AddTaskModal.displayName = 'AddTaskModal'

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ KanbanBoard ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
interface FilterState {
  priority: Priority | 'ALL'
  assignee: string | 'ALL'
}

export const KanbanBoard = React.memo(() => {
  const reduxDispatch = useDispatch<any>()
  const { projects, tasks, status: wsStatus } = useSelector((s: RootState) => s.workspace)
  const [selectedProject, setSelectedProject] = useState<string>('')
  
  // Set initial project when loaded
  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0].id)
    }
  }, [projects, selectedProject])

  const isLoading = wsStatus === 'loading'

  const [addModal, setAddModal] = useState<{ open: boolean; columnId: TaskStatus }>({ open: false, columnId: TaskStatus.TODO })
  const [filter, setFilter]    = useState<FilterState>({ priority: 'ALL', assignee: 'ALL' })
  const [isMobile, setIsMobile]= useState(window.innerWidth < 640)
  const reduced = useReducedMotion()

  // Track mobile breakpoint
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // Map Redux tasks ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ KanbanTask[]
  const kanbanTasks = useMemo<KanbanTask[]>(() =>
    tasks
      .filter(t => t.projectId === selectedProject)
      .map(t => ({
        id:            t.id,
        key:           t.key,
        title:         t.content,
        description:   t.description ?? '',
        priority:      t.priority as Priority,
        status:        t.status as TaskStatus,
        assigneeId:    null,
        assigneeName:  null,
        assigneeAvatar:`https://api.dicebear.com/7.x/initials/svg?seed=${t.id}`,
        dueDate:       t.dueDate ?? null,
        points:        t.points,
        commentCount:  t.comments ?? 0,
        projectId:     t.projectId,
        tags:          [],
        createdAt:     t.dueDate ?? new Date().toISOString(),
      }))
      .filter(t =>
        (filter.priority === 'ALL' || t.priority === filter.priority)
      ),
    [tasks, selectedProject, filter.priority]
  )

  // Build columns
  const columns = useMemo<KanbanColumnType[]>(() =>
    COLUMN_DEFS.map(def => ({
      ...def,
      tasks: kanbanTasks.filter(t => t.status === def.id),
    })),
    [kanbanTasks]
  )

  // Optimistic drag with rollback
  const prevTasks = useRef(tasks)
  const onDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const newStatus = destination.droppableId as TaskStatus
    prevTasks.current = tasks

    // Optimistic update
    reduxDispatch(updateTaskStatus({ taskId: draggableId, status: newStatus }))

    // Simulate API call ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â in prod, replace with actual fetch + rollback on failure
    const fakeApiCall = () => new Promise<void>(res => setTimeout(res, 300))
    fakeApiCall().catch(() => {
      // Rollback: restore previous tasks (in prod you'd re-dispatch with prev value)
      reduxDispatch(pushToast({ type: 'error', title: 'Move Failed', message: 'Could not update task status. Changes reverted.' }))
    })
  }, [tasks, reduxDispatch])

  // Mobile move
  const onMoveTask = useCallback((taskId: string, _from: TaskStatus, to: TaskStatus) => {
    reduxDispatch(updateTaskStatus({ taskId, status: to }))
    reduxDispatch(pushToast({ type: 'success', title: 'Task Moved', message: `Moved to ${COLUMN_DEFS.find(c => c.id === to)?.title}` }))
  }, [reduxDispatch])

  // Add task
  const handleAddTask = useCallback((data: { title: string; priority: Priority; dueDate: string; columnId: TaskStatus; projectId: string }) => {
    reduxDispatch(addTask({
      content:     data.title,
      description: '',
      points:      3,
      priority:    data.priority,
      dueDate:     data.dueDate || new Date().toISOString().split('T')[0],
      status:      data.columnId,
      projectId:   data.projectId,
    }))
    reduxDispatch(pushToast({ type: 'success', title: 'Task Created', message: `"${data.title}" added to ${COLUMN_DEFS.find(c => c.id === data.columnId)?.title}` }))
  }, [reduxDispatch])

  // Click card ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ open detail panel
  const handleTaskClick = useCallback((task: KanbanTask) => {
    reduxDispatch(setActivePanelTaskId(task.id))
  }, [reduxDispatch])

  const currentProject = projects.find(p => p.id === selectedProject)

  return (
    <div className="h-full flex flex-col" role="main" aria-label="Kanban Board">
      {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Toolbar ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-[#61dafb]" /> Sprint Board
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Project: <span className="font-mono text-[#61dafb]">{currentProject?.key ?? 'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â'}</span>
            {isMobile && <span className="ml-2 text-slate-500">(use ÃƒÂ¢Ã¢â‚¬Â Ã‚Â ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ to move cards)</span>}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Project selector */}
          <select
            aria-label="Select project"
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm text-white border border-slate-700 bg-slate-900 focus:outline-none focus:border-[#61dafb]/40 transition-colors"
          >
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          {/* Priority filter */}
          <div className="relative">
            <select
              aria-label="Filter by priority"
              value={filter.priority}
              onChange={e => setFilter(f => ({ ...f, priority: e.target.value as Priority | 'ALL' }))}
              className="pl-7 pr-3 py-2 rounded-xl text-sm text-white border border-slate-700 bg-slate-900 appearance-none focus:outline-none focus:border-[#61dafb]/40 transition-colors"
            >
              <option value="ALL">All Priorities</option>
              {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Add task */}
          <button
            onClick={() => setAddModal({ open: true, columnId: TaskStatus.TODO })}
            aria-label="Add new task"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5)', boxShadow: '0 0 20px rgba(59,130,246,0.2)' }}
          >
            <Plus className="w-4 h-4" /> New Task
          </button>
        </div>
      </div>

      {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Board ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
      {isLoading ? (
        <div className="flex gap-5 overflow-x-auto pb-4">
          {COLUMN_DEFS.map(c => <KanbanColumnSkeleton key={c.id} />)}
        </div>
      ) : projects.length === 0 ? (
        /* Empty state */
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <LayoutGrid className="w-12 h-12 text-slate-700 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Projects Yet</h3>
          <p className="text-slate-400 text-sm max-w-xs">Create a project first, then come back to manage tasks on the board.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
          {isMobile ? (
            /* Mobile: vertical stacked columns, no drag */
            <div className="space-y-6 pb-8">
              {columns.map(col => (
                <KanbanColumn
                  key={col.id}
                  column={col}
                  isMobile
                  isLoading={isLoading}
                  onAddTask={colId => setAddModal({ open: true, columnId: colId })}
                  onTaskClick={handleTaskClick}
                  onMoveTask={onMoveTask}
                  columnOrder={COLUMN_ORDER}
                />
              ))}
            </div>
          ) : (
            /* Desktop: horizontal drag-and-drop */
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex gap-5 h-full items-start min-w-max">
                {columns.map(col => (
                  <KanbanColumn
                    key={col.id}
                    column={col}
                    isMobile={false}
                    isLoading={isLoading}
                    onAddTask={colId => setAddModal({ open: true, columnId: colId })}
                    onTaskClick={handleTaskClick}
                    onMoveTask={onMoveTask}
                    columnOrder={COLUMN_ORDER}
                  />
                ))}
              </div>
            </DragDropContext>
          )}
        </div>
      )}

      {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Add Task Modal ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
      <AnimatePresence>
        {addModal.open && (
          <AddTaskModal
            defaultColumn={addModal.columnId}
            projectId={selectedProject}
            projects={projects.map(p => ({ id: p.id, name: p.name }))}
            onSave={handleAddTask}
            onClose={() => setAddModal(m => ({ ...m, open: false }))}
          />
        )}
      </AnimatePresence>
    </div>
  )
})
KanbanBoard.displayName = 'KanbanBoard'
