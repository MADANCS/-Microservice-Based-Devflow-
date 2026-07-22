import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../store/store'
import {
  fetchTeamMembers, addTeamMember, updateTeamMember, deleteTeamMember,
  updateLocalMemberStatus, updateLocalMemberAssignments, setSearchQuery, setFilterStatus,
  type TeamMember
} from '../store/teamSlice'
import { pushToast } from '../store/notificationSlice'
import { MemberModal, type MemberFormData } from '../components/MemberModal'
import {
  Users, Wifi, Clock, CheckCircle2, BarChart2,
  Mail, Code2, Palette, Briefcase, Eye, UserPlus, MoreHorizontal, X, Save, Search, Activity, Trash2, Edit3
} from 'lucide-react'

const fade = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, type: 'spring' as const, stiffness: 110 } }),
}

const ROLE_BADGE: Record<TeamMember['role'], string> = {
  OWNER:     'bg-amber-500/15 text-amber-400 border-amber-500/25',
  ADMIN:     'bg-purple-500/15 text-purple-400 border-purple-500/25',
  DEVELOPER: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  DESIGNER:  'bg-pink-500/15 text-pink-400 border-pink-500/25',
  VIEWER:    'bg-slate-500/15 text-slate-400 border-slate-500/25',
}

const ROLE_ICON: Record<TeamMember['role'], typeof Code2> = {
  OWNER: Briefcase, ADMIN: Eye, DEVELOPER: Code2, DESIGNER: Palette, VIEWER: Eye,
}

const STATUS_DOT: Record<TeamMember['status'], string> = {
  ONLINE: 'bg-emerald-400',
  AWAY:   'bg-amber-400',
  OFFLINE:'bg-dark-500',
}

const STATUS_LABEL: Record<TeamMember['status'], string> = {
  ONLINE: 'Online', AWAY: 'Away', OFFLINE: 'Offline',
}

const WORKLOAD_COLOR = (pct: number) =>
  pct >= 90 ? 'bg-rose-500' : pct >= 70 ? 'bg-amber-500' : 'bg-primary-500'

export const Team = () => {
  const dispatch = useDispatch<any>()
  const { members, activities, searchQuery, filterStatus } = useSelector((s: RootState) => s.team)
  const { tasks, projects } = useSelector((s: RootState) => s.workspace)
  
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false)
  const [editingMemberData, setEditingMemberData] = useState<Partial<TeamMember> | undefined>()

  const [editingMemberId, setEditingMemberId] = useState<string | null>(null)
  const [editProjects, setEditProjects] = useState<string[]>([])
  const [editTasks, setEditTasks] = useState<string[]>([])

  useEffect(() => {
    dispatch(fetchTeamMembers(searchQuery))
  }, [dispatch])

  const openNewMember = () => {
    setEditingMemberData(undefined)
    setIsMemberModalOpen(true)
  }

  const openEditMember = (m: TeamMember) => {
    setEditingMemberData(m)
    setIsMemberModalOpen(true)
  }

  const handleSaveMember = (data: MemberFormData) => {
    const skillsArray = data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : ['React']
    
    if (data.id) {
      dispatch(updateTeamMember({
        id: data.id,
        name: data.name,
        role: data.role,
        status: data.status,
        skills: skillsArray
      }))
      dispatch(pushToast({ type: 'success', title: 'Member Updated', message: `${data.name}'s profile was updated.` }))
    } else {
      dispatch(addTeamMember({
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        skills: skillsArray,
        projectsAssigned: [],
        tasksAssigned: []
      }))
      dispatch(pushToast({ type: 'success', title: 'Member Added', message: `${data.name} was added to the team.` }))
    }
  }

  const handleDeleteMember = (id: string) => {
    dispatch(deleteTeamMember(id))
    dispatch(pushToast({ type: 'info', title: 'Member Removed', message: 'Team member was removed.' }))
  }

  const openAssignDrawer = (member: TeamMember) => {
    setEditingMemberId(member.id)
    setEditProjects(member.projectsAssigned || [])
    setEditTasks(member.tasksAssigned || [])
  }

  const saveAssignments = () => {
    if (editingMemberId) {
      dispatch(updateLocalMemberAssignments({
        id: editingMemberId,
        projectsAssigned: editProjects,
        tasksAssigned: editTasks
      }))
      setEditingMemberId(null)
      dispatch(pushToast({ type: 'success', title: 'Assignments Synced', message: 'Real-time project & task assignments updated.' }))
    }
  }

  // Filtered members list
  const filtered = members.filter(m => {
    const matchesStatus = filterStatus === 'ALL' || m.status === filterStatus
    const q = searchQuery.toLowerCase()
    const matchesSearch = !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.skills.some(s => s.toLowerCase().includes(q))
    return matchesStatus && matchesSearch
  })

  const memberTasks = (id: string) => tasks.filter(t => members.find(m => m.id === id)?.tasksAssigned.includes(t.id))
  const memberDone  = (id: string) => memberTasks(id).filter(t => t.status === 'DONE').length
  const workloadPct = (id: string) => {
    const assigned = members.find(m => m.id === id)?.tasksAssigned.length ?? 0
    return Math.min(Math.round((assigned / 6) * 100), 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={fade} custom={0} initial="hidden" animate="visible" className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="p-2 bg-blue-500/15 text-blue-400 rounded-xl border border-blue-500/30"><Users className="w-6 h-6" /></span>
            Team Management
          </h1>
          <p className="text-dark-300 mt-1">Manage team members, roles, workloads, and task assignments in real-time.</p>
        </div>
        <button
          onClick={openNewMember}
          className="btn-primary flex items-center gap-2 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> Add Member
        </button>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={fade} custom={1} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Members',   value: members.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Online Now',      value: members.filter(m => m.status === 'ONLINE').length,   icon: Wifi,         color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'Tasks Active',    value: tasks.filter(t => t.status !== 'DONE').length,           icon: BarChart2,    color: 'text-amber-400',   bg: 'bg-amber-400/10' },
          { label: 'Completed Today', value: tasks.filter(t => t.status === 'DONE').length,           icon: CheckCircle2, color: 'text-purple-400',  bg: 'bg-purple-400/10' },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="glass-card p-5 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${s.bg} ${s.color}`}><Icon className="w-5 h-5" /></div>
              <div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-dark-400">{s.label}</p>
              </div>
            </div>
          )
        })}
      </motion.div>

      {/* Search & Status Filters Bar */}
      <motion.div variants={fade} custom={2} initial="hidden" animate="visible" className="flex items-center justify-between gap-4 flex-wrap">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-dark-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            placeholder="Search members by name, email, or skill..."
            className="input-field pl-10 bg-dark-900/60 border-dark-800"
          />
        </div>

        {/* Status Filters */}
        <div className="flex gap-1 bg-dark-900/60 p-1 rounded-xl border border-dark-800">
          {(['ALL', 'ONLINE', 'AWAY', 'OFFLINE'] as const).map(s => (
            <button
              key={s}
              onClick={() => dispatch(setFilterStatus(s))}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterStatus === s ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'text-dark-400 hover:text-white hover:bg-dark-800'
              }`}
            >
              {s === 'ALL' ? 'All' : STATUS_LABEL[s]}
            </button>
          ))}
        </div>

        {/* View mode toggle */}
        <div className="flex gap-1 bg-dark-900/60 p-1 rounded-xl border border-dark-800">
          {(['grid', 'list'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${view === v ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'text-dark-400 hover:text-white hover:bg-dark-800'}`}
            >{v}</button>
          ))}
        </div>
      </motion.div>

      {/* Main Content Layout: Members + Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-5">
          {filtered.length === 0 ? (
            <div className="glass-card p-12 text-center text-dark-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-semibold text-white">No team members match your criteria.</p>
              <p className="text-sm text-dark-400 mt-1">Try clearing the search query or adding a new member.</p>
            </div>
          ) : view === 'grid' ? (
            /* Members Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((member, i) => {
                const RoleIcon = ROLE_ICON[member.role]
                const wPct = workloadPct(member.id)
                const done = memberDone(member.id)
                const assigned = member.tasksAssigned.length

                return (
                  <motion.div key={member.id} variants={fade} custom={i + 3} initial="hidden" animate="visible"
                    className="relative glass-card p-5 flex flex-col gap-4 hover:border-primary-500/30 transition-colors overflow-hidden">
                    
                    {/* Assignment Drawer / Overlay */}
                    {editingMemberId === member.id && (
                      <div className="absolute inset-0 z-10 bg-dark-900/95 backdrop-blur p-5 flex flex-col gap-3 overflow-y-auto">
                        <div className="flex justify-between items-center">
                          <h4 className="font-semibold text-white">Assign Projects & Tasks</h4>
                          <button onClick={() => setEditingMemberId(null)} className="text-dark-400 hover:text-white p-1 hover:bg-dark-800 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                        
                        <div className="flex flex-col gap-3 flex-1">
                          <div>
                            <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-1 block">Projects</label>
                            <div className="flex flex-col gap-1.5 max-h-28 overflow-y-auto pr-1">
                              {projects.map(p => (
                                <label key={p.id} className="flex items-center gap-2 text-sm text-dark-100 cursor-pointer hover:bg-dark-800/50 p-1 rounded transition-colors">
                                  <input type="checkbox" className="accent-primary-500 rounded bg-dark-800 border-dark-600" checked={editProjects.includes(p.id)} onChange={(e) => {
                                    if (e.target.checked) setEditProjects([...editProjects, p.id])
                                    else setEditProjects(editProjects.filter(id => id !== p.id))
                                  }} /> <span className="truncate font-medium">{p.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="flex-1">
                            <label className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-1 block">Tasks</label>
                            <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                              {tasks.map(t => (
                                <label key={t.id} className="flex items-start gap-2 text-sm text-dark-100 cursor-pointer hover:bg-dark-800/50 p-1 rounded transition-colors">
                                  <input type="checkbox" className="accent-primary-500 rounded bg-dark-800 border-dark-600 mt-0.5" checked={editTasks.includes(t.id)} onChange={(e) => {
                                    if (e.target.checked) setEditTasks([...editTasks, t.id])
                                    else setEditTasks(editTasks.filter(id => id !== t.id))
                                  }} />
                                  <div className="flex flex-col leading-tight">
                                    <span className="text-[10px] text-dark-400 font-mono">{t.key}</span>
                                    <span className="line-clamp-2 text-xs">{t.content}</span>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <button onClick={saveAssignments} className="btn-primary mt-auto flex justify-center items-center gap-2 py-2 cursor-pointer">
                          <Save className="w-4 h-4" /> Save Assignments
                        </button>
                      </div>
                    )}

                    {/* Avatar Header & Actions */}
                    <div className="flex items-start justify-between">
                      <div className="relative">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${member.avatarGradient || 'from-blue-600 to-indigo-600'} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                          {member.avatar}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${STATUS_DOT[member.status]} border-2 border-dark-900`} />
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button onClick={() => openAssignDrawer(member)} className="text-dark-400 hover:text-primary-400 p-1.5 rounded-lg hover:bg-dark-800 transition-colors" title="Assign Tasks">
                          <Briefcase className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEditMember(member)} className="text-dark-400 hover:text-white p-1.5 rounded-lg hover:bg-dark-800 transition-colors" title="Edit Member">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteMember(member.id)} className="text-dark-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-dark-800 transition-colors" title="Delete Member">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Member Info */}
                    <div>
                      <h3 className="font-semibold text-white text-lg">{member.name}</h3>
                      <p className="text-xs text-dark-400 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-blue-400" />{member.email}
                      </p>
                    </div>

                    {/* Role & Status Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded border ${ROLE_BADGE[member.role]}`}>
                        <RoleIcon className="w-3 h-3" />{member.role}
                      </span>
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded border ${member.status === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' : member.status === 'AWAY' ? 'bg-amber-500/10 text-amber-400 border-amber-500/25' : 'bg-dark-700 text-dark-400 border-dark-600'}`}>
                        {STATUS_LABEL[member.status]}
                      </span>
                    </div>

                    {/* Workload Progress Bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-dark-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Workload</span>
                        <span className="font-semibold text-white">{wPct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-dark-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${wPct}%` }}
                          transition={{ duration: 0.8, delay: i * 0.05 }}
                          className={`h-full rounded-full ${WORKLOAD_COLOR(wPct)}`}
                        />
                      </div>
                      <p className="text-[10px] text-dark-500 mt-1">{done}/{assigned} tasks completed</p>
                    </div>

                    {/* Member Skills */}
                    <div className="flex flex-wrap gap-1.5">
                      {member.skills.map(skill => (
                        <span key={skill} className="text-[10px] bg-dark-800 border border-dark-700 text-dark-300 px-2 py-0.5 rounded-md font-medium">{skill}</span>
                      ))}
                    </div>

                    {/* Live Status Selector */}
                    <div className="flex gap-1.5 mt-auto pt-2 border-t border-dark-800">
                      {(['ONLINE', 'AWAY', 'OFFLINE'] as const).map(s => (
                        <button key={s} onClick={() => dispatch(updateLocalMemberStatus({ id: member.id, status: s }))}
                          className={`flex-1 text-[10px] py-1 rounded-lg font-semibold transition-all cursor-pointer ${member.status === s ? `${STATUS_DOT[s].replace('bg-', 'bg-').replace('400', '500/20')} text-white border border-dark-600` : 'bg-dark-800 text-dark-500 hover:text-dark-300 border border-transparent'}`}
                        >{s}</button>
                      ))}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            /* Members List Table View */
            <motion.div variants={fade} custom={3} initial="hidden" animate="visible" className="glass-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-800 bg-dark-900/40">
                    {['Member', 'Role', 'Status', 'Workload', 'Skills', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m, i) => {
                    const RoleIcon = ROLE_ICON[m.role]
                    const wPct = workloadPct(m.id)
                    return (
                      <tr key={m.id} className={`border-b border-dark-800/50 hover:bg-dark-800/30 transition-colors ${i % 2 === 0 ? '' : 'bg-dark-900/20'}`}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${m.avatarGradient || 'from-blue-600 to-indigo-600'} flex items-center justify-center text-white text-sm font-bold relative`}>
                              {m.avatar}
                              <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${STATUS_DOT[m.status]} border border-dark-900`} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white">{m.name}</p>
                              <p className="text-xs text-dark-400">{m.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`flex items-center gap-1 w-fit text-[10px] font-bold px-2 py-0.5 rounded border ${ROLE_BADGE[m.role]}`}>
                            <RoleIcon className="w-3 h-3" />{m.role}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${STATUS_DOT[m.status]}`} />
                            <span className="text-sm text-dark-300">{STATUS_LABEL[m.status]}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2 w-28">
                            <div className="flex-1 h-1.5 bg-dark-800 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${WORKLOAD_COLOR(wPct)}`} style={{ width: `${wPct}%` }} />
                            </div>
                            <span className="text-xs text-dark-300 font-semibold">{wPct}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {m.skills.slice(0, 3).map(s => (
                              <span key={s} className="text-[10px] bg-dark-800 text-dark-300 px-1.5 py-0.5 rounded">{s}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEditMember(m)} className="text-dark-400 hover:text-white p-1 hover:bg-dark-700 rounded transition-colors" title="Edit">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteMember(m.id)} className="text-dark-400 hover:text-rose-400 p-1 hover:bg-dark-700 rounded transition-colors" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </motion.div>
          )}
        </div>

        {/* Real-time Team Activity Log Feed */}
        <div className="glass-card p-5 h-fit flex flex-col gap-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-dark-800 pb-3">
            <Activity className="w-5 h-5 text-primary-400" />
            Team Activity Log
          </h3>

          <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
            {activities.map((act) => (
              <div key={act.id} className="p-3 bg-dark-900/50 rounded-xl border border-dark-800/60 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary-400 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-dark-200 leading-relaxed font-medium">{act.message}</p>
                  <p className="text-[10px] text-dark-500 mt-1 font-mono">{act.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        onSave={handleSaveMember}
        onDelete={handleDeleteMember}
        initialData={editingMemberData}
      />
    </div>
  )
}
