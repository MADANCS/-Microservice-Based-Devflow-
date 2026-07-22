import { useState, useEffect } from 'react'
import { X, Calendar as CalendarIcon, Briefcase, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface ProjectFormData {
  id?: string
  name: string
  key: string
  description: string
  startDate: string
  endDate: string
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED'
}

interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (project: ProjectFormData) => void
  onDelete?: (id: string) => void
  initialData?: Partial<ProjectFormData>
}

export const ProjectModal = ({ isOpen, onClose, onSave, onDelete, initialData }: ProjectModalProps) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    key: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'PLANNING'
  })

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          key: initialData.key || '',
          description: initialData.description || '',
          startDate: initialData.startDate || new Date().toISOString().split('T')[0],
          endDate: initialData.endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: initialData.status || 'PLANNING',
          id: initialData.id
        })
      } else {
        setFormData({
          name: '',
          key: '',
          description: '',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'PLANNING'
        })
      }
    }
  }, [isOpen, initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  const handleDelete = () => {
    if (initialData?.id && onDelete) {
      if (window.confirm(`Are you sure you want to delete the project "${formData.name}"? This will also delete all associated tasks.`)) {
        onDelete(initialData.id)
        onClose()
      }
    }
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
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary-400" />
                {initialData?.id ? 'Edit Project' : 'Create New Project'}
              </h2>
              <button onClick={onClose} className="text-dark-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-dark-900/30">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Project Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g. Q4 Marketing Campaign"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Project Key</label>
                  <input
                    type="text"
                    required
                    value={formData.key}
                    onChange={e => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
                    className="input-field uppercase font-mono"
                    placeholder="e.g. DEVF"
                    maxLength={10}
                    disabled={!!initialData?.id}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="input-field resize-none"
                  placeholder="Outline project goals..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-emerald-400" /> Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="input-field [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-rose-400" /> Deadline
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    className="input-field [color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className="input-field"
                >
                  <option value="PLANNING">Planning</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-dark-800/50 mt-6">
                {initialData?.id && onDelete ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/20 transition-all font-medium text-sm cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Project
                  </button>
                ) : (
                  <div />
                )}
                
                <div className="flex gap-3">
                  <button type="button" onClick={onClose} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {initialData?.id ? 'Save Changes' : 'Create Project'}
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
