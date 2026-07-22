import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Briefcase, Calendar as CalendarIcon, Clock, MoreVertical, LayoutGrid, List, Settings as SettingsIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ProjectModal } from '../components/ProjectModal'
import type { ProjectFormData } from '../components/ProjectModal'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../store/store'
import { addProject, updateProject, deleteProject } from '../store/workspaceSlice'
import { pushToast } from '../store/notificationSlice'
import { addActivityLog } from '../store/teamSlice'

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs))
}

export const Projects = () => {
  const dispatch = useDispatch<any>()
  const navigate = useNavigate()
  const projects = useSelector((state: RootState) => state.workspace.projects)
  const workspaceStatus = useSelector((state: RootState) => state.workspace.status)
  const workspaceError = useSelector((state: RootState) => state.workspace.error)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Partial<ProjectFormData> | undefined>()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const handleSaveProject = (project: ProjectFormData) => {
    if (project.id) {
      dispatch(updateProject(project as any))
      dispatch(pushToast({ type: 'success', title: 'Project Updated', message: `Project "${project.name}" was saved successfully.` }))
      dispatch(addActivityLog({ type: 'PROJECT_CREATED', message: `Project "${project.name}" details updated.` }))
    } else {
      dispatch(addProject(project))
      dispatch(pushToast({ type: 'success', title: 'Project Created', message: `New project "${project.name}" is now live!` }))
      dispatch(addActivityLog({ type: 'PROJECT_CREATED', message: `New project "${project.name}" [${project.key}] created.` }))
    }
  }

  const handleDeleteProject = (id: string) => {
    const p = projects.find(item => item.id === id)
    dispatch(deleteProject(id))
    dispatch(pushToast({ type: 'info', title: 'Project Deleted', message: `Project "${p?.name || id}" was deleted.` }))
  }

  const openNewProject = () => {
    setEditingProject(undefined)
    setIsModalOpen(true)
  }

  const openEditProject = (project: ProjectFormData) => {
    setEditingProject(project)
    setIsModalOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-md">Active</span>
      case 'PLANNING':
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-md">Planning</span>
      case 'COMPLETED':
        return <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-400/10 border border-blue-400/20 rounded-md">Completed</span>
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    const d = new Date(dateString)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-primary-500" />
            Projects
          </h1>
          <p className="text-dark-300">Manage your ongoing initiatives and track deadlines.</p>
        </div>
        
        <div className="flex gap-4 items-center">
          <div className="flex items-center bg-dark-900/50 rounded-lg p-1 border border-dark-800">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn("p-1.5 rounded-md transition-colors", viewMode === 'grid' ? "bg-dark-700 text-white shadow" : "text-dark-400 hover:text-dark-200")}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn("p-1.5 rounded-md transition-colors", viewMode === 'list' ? "bg-dark-700 text-white shadow" : "text-dark-400 hover:text-dark-200")}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button onClick={openNewProject} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" /> New Project
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        <div className={cn(
          "grid gap-6",
          viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
        )}>
          {workspaceStatus === 'loading' && projects.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-dark-400">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p>Loading projects...</p>
            </div>
          )}
          
          {workspaceStatus === 'failed' && projects.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-rose-400 bg-rose-500/10 rounded-xl border border-rose-500/20">
              <p className="font-semibold mb-1">Failed to load projects</p>
              <p className="text-sm">{workspaceError || 'Backend service unreachable.'}</p>
            </div>
          )}
          
          {workspaceStatus !== 'loading' && workspaceStatus !== 'failed' && projects.length === 0 && (
            <div className="col-span-full py-12 text-center text-dark-400 bg-dark-900/50 rounded-xl border border-dark-800">
              <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No projects found. Create one to get started.</p>
            </div>
          )}
          
          {projects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="relative p-6 flex flex-col group cursor-pointer overflow-hidden rounded-2xl bg-dark-900/60 border border-dark-800/80 hover:border-primary-500/50 backdrop-blur-xl shadow-xl hover:shadow-primary-500/10"
              onClick={() => openEditProject(project)}
            >
              {/* Background Glow Effect */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl group-hover:bg-primary-500/20 transition-all duration-500"></div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-900/30 flex items-center justify-center border border-primary-500/20 group-hover:border-primary-500/50 group-hover:bg-primary-500/20 transition-all">
                    <Briefcase className="w-5 h-5 text-primary-400 group-hover:text-primary-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors">{project.name}</h3>
                    <p className="text-xs text-dark-400 font-mono mt-0.5 opacity-70">{project.key}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    className="text-dark-400 hover:text-primary-400 p-1.5 hover:bg-dark-800 rounded-lg transition-colors"
                    title="Project Settings"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate('/settings')
                    }}
                  >
                    <SettingsIcon className="w-4 h-4" />
                  </button>
                  <button className="text-dark-500 hover:text-white p-1.5 hover:bg-dark-800 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); openEditProject(project); }}>
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-dark-300 text-sm leading-relaxed mb-6 flex-1 line-clamp-2 relative z-10 group-hover:text-dark-200 transition-colors">
                {project.description}
              </p>

              <div className="border-t border-dark-800/50 pt-4 flex items-center justify-between mt-auto relative z-10">
                {getStatusBadge(project.status)}
                
                <div className="flex items-center gap-4 text-xs font-semibold text-dark-400">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-dark-950/50 rounded-md border border-dark-800" title="Start Date">
                    <Clock className="w-3.5 h-3.5 text-primary-500" />
                    {formatDate(project.startDate)}
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-rose-500/10 rounded-md border border-rose-500/20 text-rose-400/90 group-hover:text-rose-400 transition-colors" title="Deadline">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    {formatDate(project.endDate)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <ProjectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProject}
        onDelete={handleDeleteProject}
        initialData={editingProject}
      />
    </div>
  )
}
