import { useState } from 'react'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../store/store'
import { setMode, setAccent, toggleCompactMode, type ThemeMode, type AccentColor } from '../store/themeSlice'
import { pushToast } from '../store/notificationSlice'
import { updateProject, updateProjectSettings, deleteProject } from '../store/workspaceSlice'
import {
  User, Bell, Palette, Shield, Link2, Globe, Moon, Sun, Monitor,
  Check, ChevronRight, KeyRound, Plug, Database, FolderKanban,
  Sliders, AlertTriangle, Archive, Trash2
} from 'lucide-react'

const fade = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

type Section = 'profile' | 'appearance' | 'project' | 'notifications' | 'security' | 'integrations'

const ACCENT_OPTIONS: { value: AccentColor; color: string }[] = [
  { value: 'blue',   color: 'bg-blue-500' },
  { value: 'indigo', color: 'bg-indigo-500' },
  { value: 'violet', color: 'bg-violet-500' },
  { value: 'emerald',color: 'bg-emerald-500' },
  { value: 'rose',   color: 'bg-rose-500' },
]

const THEME_OPTIONS: { value: ThemeMode; icon: typeof Moon; label: string }[] = [
  { value: 'dark', icon: Moon, label: 'Dark' },
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'system', icon: Monitor, label: 'System' },
]

const INTEGRATIONS = [
  { name: 'GitHub', desc: 'Link PRs and commits to tasks', icon: '🚀', connected: true },
  { name: 'Slack', desc: 'Get notified in your workspace channels', icon: '💬', connected: true },
  { name: 'Figma', desc: 'Embed design files in task descriptions', icon: '🎨', connected: false },
  { name: 'Jira', desc: 'Bi-directional sync with existing Jira board', icon: '🔷', connected: false },
  { name: 'Linear', desc: 'Import issues from Linear projects', icon: '⚡', connected: false },
  { name: 'Notion', desc: 'Connect your Notion wiki for docs', icon: '📝', connected: false },
]

const NOTIFICATION_OPTS = [
  { label: 'Task assigned to me', key: 'taskAssigned', enabled: true },
  { label: 'Task status changes', key: 'statusChange', enabled: true },
  { label: 'New comments on my tasks', key: 'newComment', enabled: true },
  { label: 'Sprint start / end reminders', key: 'sprintReminder', enabled: false },
  { label: 'Daily digest email', key: 'dailyDigest', enabled: false },
  { label: 'Team mentions (@me)', key: 'mentions', enabled: true },
]

const Toggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
  <button
    onClick={onToggle}
    className={`relative w-10 h-5.5 rounded-full transition-colors ${enabled ? 'bg-primary-500' : 'bg-dark-700'}`}
    style={{ height: '22px' }}
  >
    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
)

const SectionRow = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between py-4 border-b border-dark-800/50 last:border-0">
    <span className="text-sm text-dark-200">{title}</span>
    {children}
  </div>
)

export const Settings = () => {
  const dispatch = useDispatch<any>()
  const { mode, accent, compactMode } = useSelector((s: RootState) => s.theme)
  const projects = useSelector((s: RootState) => s.workspace.projects)

  const [section, setSection] = useState<Section>('profile')
  const [notifState, setNotifState] = useState(NOTIFICATION_OPTS)
  const [integrations, setIntegrations] = useState(INTEGRATIONS)
  const [profileName, setProfileName] = useState('Alex Developer')
  const [profileEmail] = useState('alex@devflow.io')

  // Project settings form state
  const [selectedProjId, setSelectedProjId] = useState<string>(projects[0]?.id || '')
  const selectedProj = projects.find(p => p.id === selectedProjId) || projects[0]

  const [projName, setProjName] = useState(selectedProj?.name || '')
  const [projKey, setProjKey] = useState(selectedProj?.key || '')
  const [projDesc, setProjDesc] = useState(selectedProj?.description || '')
  const [projStatus, setProjStatus] = useState<any>(selectedProj?.status || 'ACTIVE')
  const [projVisibility, setProjVisibility] = useState<any>(selectedProj?.settings?.visibility || 'PRIVATE')
  const [defaultPriority, setDefaultPriority] = useState<any>(selectedProj?.settings?.defaultPriority || 'MEDIUM')
  const [defaultStatus, setDefaultStatus] = useState<any>(selectedProj?.settings?.defaultStatus || 'TODO')
  const [wipLimit, setWipLimit] = useState<number>(selectedProj?.settings?.wipLimit || 10)

  const handleSelectProj = (id: string) => {
    setSelectedProjId(id)
    const p = projects.find(item => item.id === id)
    if (p) {
      setProjName(p.name)
      setProjKey(p.key)
      setProjDesc(p.description)
      setProjStatus(p.status)
      setProjVisibility(p.settings?.visibility || 'PRIVATE')
      setDefaultPriority(p.settings?.defaultPriority || 'MEDIUM')
      setDefaultStatus(p.settings?.defaultStatus || 'TODO')
      setWipLimit(p.settings?.wipLimit || 10)
    }
  }

  const saveWorkspaceSettings = () => dispatch(pushToast({ type: 'success', title: 'Settings Saved', message: 'Your preferences have been updated.' }))

  const handleSaveProjectSettings = () => {
    if (!selectedProj) return
    dispatch(updateProject({
      ...selectedProj,
      name: projName,
      description: projDesc,
      status: projStatus,
    }))
    dispatch(updateProjectSettings({
      projectId: selectedProj.id,
      settings: {
        visibility: projVisibility,
        defaultPriority,
        defaultStatus,
        wipLimit,
      }
    }))
    dispatch(pushToast({
      type: 'success',
      title: 'Project Settings Updated',
      message: `Settings for '${projName}' saved successfully.`
    }))
  }

  const handleDeleteProj = () => {
    if (!selectedProj) return
    if (window.confirm(`Are you sure you want to delete project '${selectedProj.name}'?`)) {
      dispatch(deleteProject(selectedProj.id))
      dispatch(pushToast({ type: 'info', title: 'Project Deleted', message: `'${selectedProj.name}' has been deleted.` }))
      if (projects.length > 1) {
        handleSelectProj(projects.filter(p => p.id !== selectedProj.id)[0].id)
      }
    }
  }

  const navItems: { key: Section; label: string; icon: typeof User }[] = [
    { key: 'profile',       label: 'Profile',       icon: User },
    { key: 'appearance',    label: 'Appearance',    icon: Palette },
    { key: 'project',       label: 'Project Settings', icon: FolderKanban },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'security',      label: 'Security',      icon: Shield },
    { key: 'integrations',  label: 'Integrations',  icon: Plug },
  ]

  return (
    <div className="space-y-6">
      <motion.div variants={fade} custom={0} initial="hidden" animate="visible">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="p-2 bg-dark-800 text-dark-200 rounded-xl border border-dark-700"><Globe className="w-6 h-6" /></span>
          Workspace & Project Settings
        </h1>
        <p className="text-dark-300 mt-1">Manage profile, project defaults, rules, preferences, and integrations.</p>
      </motion.div>

      <motion.div variants={fade} custom={1} initial="hidden" animate="visible" className="flex gap-6">
        {/* Sidebar Nav */}
        <aside className="w-56 flex-shrink-0">
          <nav className="space-y-1 glass-card p-2">
            {navItems.map(item => {
              const Icon = item.icon
              const active = section === item.key
              return (
                <button
                  key={item.key}
                  onClick={() => setSection(item.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-all ${
                    active ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20' : 'text-dark-300 hover:bg-dark-800/50 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                  {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1">
          {section === 'profile' && (
            <motion.div variants={fade} custom={2} initial="hidden" animate="visible" className="glass-card p-6 space-y-6">
              <h2 className="text-lg font-semibold text-white">Profile Information</h2>
              <div className="flex items-center gap-5">
                <div className="relative">
                  <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Avatar" className="w-20 h-20 rounded-2xl border-2 border-dark-700" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-dark-900 rounded-full" />
                </div>
                <div>
                  <button className="btn-secondary text-sm px-4 py-2">Change Photo</button>
                  <p className="text-xs text-dark-400 mt-1.5">JPG, PNG or GIF. Max 2MB.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-1.5 block">Full Name</label>
                  <input value={profileName} onChange={e => setProfileName(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-1.5 block">Email Address</label>
                  <input value={profileEmail} readOnly className="input-field opacity-60 cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-1.5 block">Role</label>
                  <input defaultValue="Full-Stack Engineer" className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-1.5 block">Timezone</label>
                  <select className="input-field">
                    <option>Asia/Kolkata (IST +5:30)</option>
                    <option>America/New_York (EST)</option>
                    <option>Europe/London (GMT)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button onClick={saveWorkspaceSettings} className="btn-primary px-6">Save Changes</button>
              </div>
            </motion.div>
          )}

          {section === 'project' && (
            <motion.div variants={fade} custom={2} initial="hidden" animate="visible" className="space-y-6">
              {/* Project selector header */}
              <div className="glass-card p-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-white">Select Target Project</h2>
                  <p className="text-xs text-dark-400">Choose a project to configure rules, visibility, and defaults.</p>
                </div>
                <select
                  value={selectedProjId}
                  onChange={e => handleSelectProj(e.target.value)}
                  className="input-field w-64 text-sm bg-dark-900 border-dark-700"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.key})
                    </option>
                  ))}
                </select>
              </div>

              {/* General Project Settings */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-primary-400" /> General Project Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-1 block">Project Name</label>
                    <input value={projName} onChange={e => setProjName(e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-1 block">Project Key</label>
                    <input value={projKey} disabled className="input-field opacity-60 cursor-not-allowed font-mono" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-1 block">Description</label>
                    <textarea rows={3} value={projDesc} onChange={e => setProjDesc(e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-1 block">Status</label>
                    <select value={projStatus} onChange={e => setProjStatus(e.target.value)} className="input-field">
                      <option value="ACTIVE">Active</option>
                      <option value="PLANNING">Planning</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-1 block">Visibility</label>
                    <select value={projVisibility} onChange={e => setProjVisibility(e.target.value)} className="input-field">
                      <option value="PRIVATE">Private (Team Members Only)</option>
                      <option value="INTERNAL">Internal (Company Workspace)</option>
                      <option value="PUBLIC">Public</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Workflow & Priority Rules */}
              <div className="glass-card p-6 space-y-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" /> Default Task Rules & WIP Limits
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-1 block">Default Priority</label>
                    <select value={defaultPriority} onChange={e => setDefaultPriority(e.target.value)} className="input-field">
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-1 block">Initial Task Column</label>
                    <select value={defaultStatus} onChange={e => setDefaultStatus(e.target.value)} className="input-field">
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-1 block">Column WIP Limit</label>
                    <input type="number" min={1} max={50} value={wipLimit} onChange={e => setWipLimit(Number(e.target.value))} className="input-field" />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button onClick={handleSaveProjectSettings} className="btn-primary px-6">Save Project Configuration</button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="glass-card p-6 border-rose-500/30 bg-rose-500/5 space-y-4">
                <h3 className="text-base font-semibold text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Danger Zone
                </h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-dark-900/60 rounded-xl border border-rose-500/20">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Delete Project</h4>
                    <p className="text-xs text-dark-400">Permanently delete project '{selectedProj?.name}' and all associated tasks.</p>
                  </div>
                  <button onClick={handleDeleteProj} className="btn-secondary text-xs px-4 py-2 text-rose-400 border-rose-500/40 hover:bg-rose-500/20 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Delete Project
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {section === 'appearance' && (
            <motion.div variants={fade} custom={2} initial="hidden" animate="visible" className="glass-card p-6 space-y-6">
              <h2 className="text-lg font-semibold text-white">Appearance</h2>
              <div>
                <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3 block">Color Mode</label>
                <div className="flex gap-3">
                  {THEME_OPTIONS.map(opt => {
                    const Icon = opt.icon
                    return (
                      <button
                        key={opt.value}
                        onClick={() => dispatch(setMode(opt.value))}
                        className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                          mode === opt.value ? 'border-primary-500/50 bg-primary-500/10 text-primary-400' : 'border-dark-700 text-dark-400 hover:border-dark-600 hover:text-white bg-dark-800/40'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{opt.label}</span>
                        {mode === opt.value && <Check className="w-4 h-4" />}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3 block">Accent Color</label>
                <div className="flex gap-3">
                  {ACCENT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => dispatch(setAccent(opt.value))}
                      className={`w-10 h-10 rounded-full ${opt.color} flex items-center justify-center transition-all border-2 ${
                        accent === opt.value ? 'border-white scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      {accent === opt.value && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-0 divide-y divide-dark-800">
                <SectionRow title="Compact Mode">
                  <Toggle enabled={compactMode} onToggle={() => dispatch(toggleCompactMode())} />
                </SectionRow>
              </div>
            </motion.div>
          )}

          {section === 'notifications' && (
            <motion.div variants={fade} custom={2} initial="hidden" animate="visible" className="glass-card p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white">Notification Preferences</h2>
              <div className="space-y-0 divide-y divide-dark-800">
                {notifState.map((n, i) => (
                  <SectionRow key={n.key} title={n.label}>
                    <Toggle enabled={n.enabled} onToggle={() => {
                      const next = [...notifState]
                      next[i] = { ...next[i], enabled: !next[i].enabled }
                      setNotifState(next)
                    }} />
                  </SectionRow>
                ))}
              </div>
              <div className="flex justify-end pt-2">
                <button onClick={saveWorkspaceSettings} className="btn-primary px-6">Save Preferences</button>
              </div>
            </motion.div>
          )}

          {section === 'security' && (
            <motion.div variants={fade} custom={2} initial="hidden" animate="visible" className="glass-card p-6 space-y-6">
              <h2 className="text-lg font-semibold text-white">Security</h2>
              <div className="space-y-4">
                {[
                  { icon: KeyRound, title: 'Change Password', desc: 'Update your password regularly to keep your account safe.', action: 'Update' },
                  { icon: Shield, title: 'Two-Factor Authentication', desc: '2FA is currently enabled via Authenticator App.', action: 'Manage', badge: 'Enabled' },
                  { icon: Database, title: 'Active Sessions', desc: 'You have 2 active sessions. Last login from Mumbai, India.', action: 'Revoke All' },
                ].map((item, i) => {
                  const Icon = item.icon
                  return (
                    <div key={i} className="flex items-start gap-4 p-4 bg-dark-800/40 rounded-xl border border-dark-700/50">
                      <div className="p-2.5 bg-dark-700 rounded-xl text-dark-200 flex-shrink-0"><Icon className="w-5 h-5" /></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                          {item.badge && <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.5 rounded font-bold">{item.badge}</span>}
                        </div>
                        <p className="text-xs text-dark-400">{item.desc}</p>
                      </div>
                      <button onClick={saveWorkspaceSettings} className="btn-secondary text-xs px-3 py-1.5 flex-shrink-0">{item.action}</button>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {section === 'integrations' && (
            <motion.div variants={fade} custom={2} initial="hidden" animate="visible" className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Integrations</h2>
                <span className="text-xs text-dark-400 flex items-center gap-1"><Link2 className="w-3.5 h-3.5" /> {integrations.filter(i => i.connected).length} connected</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {integrations.map((intg, i) => (
                  <div key={i} className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${intg.connected ? 'border-emerald-500/25 bg-emerald-500/5' : 'border-dark-700 bg-dark-800/40 hover:border-dark-600'}`}>
                    <span className="text-2xl">{intg.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">{intg.name}</p>
                      <p className="text-xs text-dark-400 truncate">{intg.desc}</p>
                    </div>
                    <button
                      onClick={() => {
                        const next = [...integrations]
                        next[i] = { ...next[i], connected: !next[i].connected }
                        setIntegrations(next)
                        dispatch(pushToast({ type: intg.connected ? 'info' : 'success', title: intg.connected ? `${intg.name} Disconnected` : `${intg.name} Connected`, message: intg.connected ? 'Integration removed.' : 'Integration is now active.' }))
                      }}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all flex-shrink-0 ${
                        intg.connected
                          ? 'border-emerald-500/30 text-emerald-400 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30'
                          : 'border-primary-500/30 text-primary-400 hover:bg-primary-500/10'
                      }`}
                    >
                      {intg.connected ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
