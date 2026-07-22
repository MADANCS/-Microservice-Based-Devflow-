import { useState, useEffect } from 'react'
import { X, User, Mail, Shield, Code, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { TeamMember } from '../store/teamSlice'

export interface MemberFormData {
  id?: string
  name: string
  email: string
  role: TeamMember['role']
  status: TeamMember['status']
  skills: string
}

interface MemberModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (member: MemberFormData) => void
  onDelete?: (id: string) => void
  initialData?: Partial<TeamMember>
}

export const MemberModal = ({ isOpen, onClose, onSave, onDelete, initialData }: MemberModalProps) => {
  const [formData, setFormData] = useState<MemberFormData>({
    name: '',
    email: '',
    role: 'DEVELOPER',
    status: 'ONLINE',
    skills: ''
  })

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          id: initialData.id,
          name: initialData.name || '',
          email: initialData.email || '',
          role: initialData.role || 'DEVELOPER',
          status: initialData.status || 'ONLINE',
          skills: initialData.skills ? initialData.skills.join(', ') : ''
        })
      } else {
        setFormData({
          name: '',
          email: '',
          role: 'DEVELOPER',
          status: 'ONLINE',
          skills: ''
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
      if (window.confirm(`Are you sure you want to remove ${formData.name} from the team?`)) {
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
                <User className="w-5 h-5 text-primary-400" />
                {initialData?.id ? 'Edit Team Member' : 'Add New Team Member'}
              </h2>
              <button onClick={onClose} className="text-dark-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-dark-900/30">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary-400" /> Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Alex Dev"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-400" /> Email Address
                </label>
                <input
                  type="email"
                  required
                  disabled={!!initialData?.id}
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="input-field disabled:opacity-50"
                  placeholder="e.g. alex@devflow.io"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-400" /> Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                    className="input-field"
                  >
                    <option value="OWNER">Owner</option>
                    <option value="ADMIN">Admin</option>
                    <option value="DEVELOPER">Developer</option>
                    <option value="DESIGNER">Designer</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-1.5">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="input-field"
                  >
                    <option value="ONLINE">Online</option>
                    <option value="AWAY">Away</option>
                    <option value="OFFLINE">Offline</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5 flex items-center gap-2">
                  <Code className="w-4 h-4 text-emerald-400" /> Skills (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={e => setFormData({ ...formData, skills: e.target.value })}
                  className="input-field"
                  placeholder="e.g. React, Java, Spring Boot, Figma"
                />
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-dark-800/50 mt-6">
                {initialData?.id && onDelete ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/20 transition-all font-medium text-sm cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Member
                  </button>
                ) : (
                  <div />
                )}
                
                <div className="flex gap-3">
                  <button type="button" onClick={onClose} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {initialData?.id ? 'Save Changes' : 'Add Member'}
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
