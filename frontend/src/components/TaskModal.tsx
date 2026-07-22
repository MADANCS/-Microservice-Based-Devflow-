import { useState, useEffect } from 'react'
import { X, Calendar as CalendarIcon, Flag, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface TaskFormData {
  id?: string
  content: string
  description: string
  points: number
  priority: Priority
  dueDate: string
  columnId?: string
  projectId?: string
}

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: TaskFormData) => void
  onDelete?: (id: string) => void
  initialData?: Partial<TaskFormData>
  columns: { id: string; title: string }[]
}

export const TaskModal = ({ isOpen, onClose, onSave, onDelete, initialData, columns }: TaskModalProps) => {
  const [formData, setFormData] = useState<TaskFormData>({
    content: '',
    description: '',
    points: 1,
    priority: 'MEDIUM',
    dueDate: new Date().toISOString().split('T')[0],
    columnId: columns[0]?.id
  })

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...formData, ...initialData })
      } else {
        setFormData({
          content: '',
          description: '',
          points: 1,
          priority: 'MEDIUM',
          dueDate: new Date().toISOString().split('T')[0],
          columnId: columns[0]?.id
        })
      }
    }
  }, [isOpen, initialData, columns])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg glass-panel rounded-2xl overflow-hidden shadow-2xl border border-dark-700/50"
          >
            <div className="flex justify-between items-center p-6 border-b border-dark-800/50 bg-dark-900/50">
              <h2 className="text-xl font-semibold text-white">
                {initialData?.id ? 'Edit Task' : 'Create New Task'}
              </h2>
              <button onClick={onClose} className="text-dark-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-dark-900/30">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Task Title</label>
                <input
                  type="text"
                  required
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Implement user authentication"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="input-field resize-none"
                  placeholder="Add more details..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-primary-400" /> Deadline
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                    className="input-field [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5 flex items-center gap-2">
                    <Flag className="w-4 h-4 text-amber-400" /> Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value as Priority })}
                    className="input-field"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Story Points</label>
                  <input
                    type="number"
                    min="1"
                    max="21"
                    value={formData.points}
                    onChange={e => setFormData({ ...formData, points: parseInt(e.target.value) || 1 })}
                    className="input-field"
                  />
                </div>
                {!initialData?.id && (
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1.5">Status</label>
                    <select
                      value={formData.columnId}
                      onChange={e => setFormData({ ...formData, columnId: e.target.value })}
                      className="input-field"
                    >
                      {columns.map(col => (
                        <option key={col.id} value={col.id}>{col.title}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-dark-800/50 mt-6">
                {initialData?.id && onDelete ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete this task?`)) {
                        onDelete(initialData.id!)
                        onClose()
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/20 transition-all font-medium text-sm cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Task
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex gap-3">
                  <button type="button" onClick={onClose} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {initialData?.id ? 'Save Changes' : 'Create Task'}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
