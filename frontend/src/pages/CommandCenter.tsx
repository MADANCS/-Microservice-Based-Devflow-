import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { useDispatch, useSelector } from 'react-redux'
import { 
  Plus, Briefcase, Calendar as CalendarIcon, Clock,
  CheckSquare, Trash2, Edit2, ChevronLeft, ChevronRight, Zap
} from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import type { RootState } from '../store/store'
import { 
  addTask, updateTask, deleteTask, updateTaskStatus,
  addProject, updateProject, deleteProject,
  fetchProjects, fetchTasks
} from '../store/workspaceSlice'
import { pushToast } from '../store/notificationSlice'
import { addActivityLog } from '../store/teamSlice'

import { ProjectModal } from '../components/ProjectModal'
import { TaskModal } from '../components/TaskModal'
import type { ProjectFormData } from '../components/ProjectModal'
import type { TaskFormData } from '../components/TaskModal'

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs))
}

const priorityColors: Record<string, { bg: string, text: string, border: string }> = {
  CRITICAL: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  HIGH:     { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  MEDIUM:   { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  LOW:      { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
}

export const CommandCenter = () => {
  const dispatch = useDispatch<any>()
  const projects = useSelector((state: RootState) => state.workspace.projects)
  const tasks = useSelector((state: RootState) => state.workspace.tasks)

  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL')
  
  // Modals
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Partial<ProjectFormData> | undefined>()
  const [editingTask, setEditingTask] = useState<Partial<TaskFormData> | undefined>()

  // --- Data Fetching ---
  useEffect(() => {
    dispatch(fetchProjects() as any)
  }, [dispatch])

  useEffect(() => {
    if (projects.length > 0) {
      if (selectedProjectId === 'ALL') {
        projects.forEach(p => dispatch(fetchTasks(p.id) as any))
      } else {
        dispatch(fetchTasks(selectedProjectId) as any)
      }
    }
  }, [dispatch, selectedProjectId, projects.length])

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date())
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // --- Data Handlers ---
  const handleSaveProject = (project: ProjectFormData) => {
    if (project.id) {
      dispatch(updateProject(project as any) as any)
      dispatch(pushToast({ type: 'success', title: 'Project Saved', message: `Project "${project.name}" details updated.` }))
      dispatch(addActivityLog({ type: 'PROJECT_CREATED', message: `Project "${project.name}" updated.` }))
    } else {
      dispatch(addProject(project as any) as any).then(() => {
        dispatch(fetchProjects() as any)
      })
      dispatch(pushToast({ type: 'success', title: 'Project Created', message: `New project "${project.name}" [${project.key}] created.` }))
      dispatch(addActivityLog({ type: 'PROJECT_CREATED', message: `New project "${project.name}" created.` }))
    }
  }

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const proj = projects.find(p => p.id === id)
    dispatch(deleteProject(id) as any)
    if (selectedProjectId === id) setSelectedProjectId('ALL')
    dispatch(pushToast({ type: 'info', title: 'Project Deleted', message: `Project "${proj?.name || id}" was deleted.` }))
  }

  const handleSaveTask = (taskData: TaskFormData) => {
    if (taskData.id) {
      const existing = tasks.find(t => t.id === taskData.id)
      if (existing) {
        dispatch(updateTask({ ...existing, ...taskData } as any) as any)
        dispatch(pushToast({ type: 'success', title: 'Task Saved', message: `Task "${taskData.content}" updated.` }))
        dispatch(addActivityLog({ type: 'TASK_ASSIGNED', message: `Task "${taskData.content}" details updated.` }))
      }
    } else {
      dispatch(addTask({
        ...taskData,
        status: (taskData.columnId || 'TODO') as any,
        projectId: taskData.projectId || projects[0]?.id || ''
      } as any) as any)
      dispatch(pushToast({ type: 'success', title: 'Task Created', message: `New task "${taskData.content}" added.` }))
      dispatch(addActivityLog({ type: 'TASK_ASSIGNED', message: `New task "${taskData.content}" created.` }))
    }
  }

  const handleDeleteTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const task = tasks.find(t => t.id === id)
    dispatch(deleteTask(id) as any)
    dispatch(pushToast({ type: 'info', title: 'Task Removed', message: `Task "${task?.content || id}" deleted.` }))
  }

  // --- Filtering ---
  const filteredTasks = useMemo(() => {
    if (selectedProjectId === 'ALL') return tasks
    return tasks.filter(t => t.projectId === selectedProjectId)
  }, [tasks, selectedProjectId])

  const columns = [
    { id: 'TODO', title: 'To Do', color: 'border-slate-500/30' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-blue-500/30' },
    { id: 'DONE', title: 'Done', color: 'border-emerald-500/30' }
  ]

  // --- Calendar Logic ---
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayIndex = new Date(year, month, 1).getDay()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const gridCells = useMemo(() => {
    const cells: any[] = []
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i)
      cells.push({ date: d, dateString: d.toISOString().split('T')[0], dayNum: d.getDate(), isCurrentMonth: false })
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i)
      cells.push({ date: d, dateString: d.toISOString().split('T')[0], dayNum: i, isCurrentMonth: true })
    }
    const remaining = 42 - cells.length
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i)
      cells.push({ date: d, dateString: d.toISOString().split('T')[0], dayNum: i, isCurrentMonth: false })
    }
    return cells
  }, [year, month, daysInMonth, firstDayIndex, daysInPrevMonth])

  const dateTasksMap = useMemo(() => {
    const map: Record<string, typeof tasks> = {}
    gridCells.forEach(c => map[c.dateString] = [])
    filteredTasks.forEach(t => {
      if (map[t.dueDate]) map[t.dueDate].push(t)
    })
    return map
  }, [gridCells, filteredTasks])

  const calculateDaysRemaining = (dueDate: string) => {
    const today = Date.now()
    const due = new Date(dueDate).getTime()
    return Math.ceil((due - today) / (1000 * 60 * 60 * 24))
  }

  // --- Drag and Drop Logic ---
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const draggedTask = tasks.find(t => t.id === draggableId)
    if (draggedTask) {
      dispatch(updateTaskStatus({ taskId: draggedTask.id, status: destination.droppableId }) as any)
      dispatch(pushToast({ type: 'info', title: 'Task Moved', message: `Task "${draggedTask.content}" moved to ${destination.droppableId.replace('_', ' ')}.` }))
    }
  }

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="p-2 bg-primary-500/20 text-primary-400 rounded-xl border border-primary-500/30">
              <Zap className="w-6 h-6" />
            </span>
            Command Center
          </h1>
          <p className="text-dark-300 mt-2 flex items-center gap-2">
            Unified workspace for managing projects, tasks, and real-time deadlines.
          </p>
        </div>
      </div>

      {/* 3-Column Bento Box Layout */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-0">
        
        {/* COLUMN 1: PROJECTS (3/12) */}
        <div className="xl:col-span-3 glass-panel rounded-2xl border border-dark-800 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-dark-800/50 flex justify-between items-center bg-dark-900/40">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-400" />
              Projects
            </h2>
            <button 
              onClick={() => { setEditingProject(undefined); setIsProjectModalOpen(true) }}
              className="p-1.5 bg-primary-500/10 text-primary-400 hover:bg-primary-500 hover:text-white rounded-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            <div 
              onClick={() => setSelectedProjectId('ALL')}
              className={cn(
                "p-3 rounded-xl cursor-pointer transition-all border",
                selectedProjectId === 'ALL' ? "bg-primary-500/10 border-primary-500/50 text-primary-400 font-semibold" : "bg-dark-900/40 border-dark-800 text-dark-300 hover:border-dark-600 hover:bg-dark-800"
              )}
            >
              <h3 className="font-semibold text-sm">All Projects</h3>
            </div>
            {projects.map(proj => {
              const projTasks = tasks.filter(t => t.projectId === proj.id)
              const completedProjTasks = projTasks.filter(t => t.status === 'DONE').length
              const progressPct = projTasks.length > 0 ? Math.round((completedProjTasks / projTasks.length) * 100) : 0

              return (
                <motion.div 
                  key={proj.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={cn(
                    "p-4 rounded-xl cursor-pointer transition-all border group relative overflow-hidden",
                    selectedProjectId === proj.id ? "bg-primary-500/10 border-primary-500/50 shadow-lg shadow-primary-500/5" : "bg-dark-900/40 border-dark-800 hover:border-dark-600 hover:bg-dark-800"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={cn("font-bold text-sm", selectedProjectId === proj.id ? "text-primary-300" : "text-white")}>
                      {proj.name}
                    </h3>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); setEditingProject(proj); setIsProjectModalOpen(true); }} className="text-dark-400 hover:text-white p-1"><Edit2 className="w-3 h-3" /></button>
                      <button onClick={(e) => handleDeleteProject(proj.id, e)} className="text-dark-400 hover:text-rose-400 p-1"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                  <p className="text-xs text-dark-400 line-clamp-2 mb-3">{proj.description}</p>
                  
                  {/* Mini Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-[10px] font-semibold text-dark-400 mb-1">
                      <span>Progress</span>
                      <span>{progressPct}%</span>
                    </div>
                    <div className="w-full h-1 bg-dark-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-500" 
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-semibold">
                    <span className={cn("px-2 py-0.5 rounded uppercase tracking-wider", proj.status === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-400" : "bg-dark-700 text-dark-300")}>{proj.status}</span>
                    <span className="text-dark-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(proj.endDate).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* COLUMN 2: TASKS KANBAN (5/12) */}
        <div className="xl:col-span-5 glass-panel rounded-2xl border border-dark-800 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-dark-800/50 flex justify-between items-center bg-dark-900/40">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-400" />
              Tasks Board
            </h2>
            <button 
              onClick={() => { setEditingTask({ projectId: selectedProjectId !== 'ALL' ? selectedProjectId : undefined }); setIsTaskModalOpen(true) }}
              className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Task
            </button>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 flex gap-4 scrollbar-thin">
              {columns.map(col => {
                const colTasks = filteredTasks.filter(t => t.status === col.id)
                return (
                  <div key={col.id} className="flex-1 min-w-[250px] flex flex-col gap-3">
                    <div className={cn("text-xs font-bold uppercase tracking-wider text-dark-300 pb-2 border-b-2", col.color)}>
                      {col.title} ({colTasks.length})
                    </div>
                    
                    <Droppable droppableId={col.id}>
                      {(provided, snapshot) => (
                        <div 
                          ref={provided.innerRef} 
                          {...provided.droppableProps}
                          className={cn(
                            "flex-1 overflow-y-auto space-y-3 scrollbar-thin pb-4 rounded-xl transition-colors",
                            snapshot.isDraggingOver ? "bg-dark-800/30" : ""
                          )}
                        >
                          <AnimatePresence>
                            {colTasks.map((task, index) => {
                              const colors = priorityColors[task.priority] || priorityColors.MEDIUM
                              const daysLeft = calculateDaysRemaining(task.dueDate)
                              const isUrgent = daysLeft <= 2 && task.status !== 'DONE'
                              
                              return (
                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      style={{ ...provided.draggableProps.style }}
                                    >
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className={cn(
                                          "bg-dark-900/80 border p-3 rounded-xl cursor-grab active:cursor-grabbing hover:border-primary-500/50 transition-colors group relative",
                                          isUrgent ? "border-rose-500/30" : "border-dark-700",
                                          snapshot.isDragging ? "shadow-2xl shadow-primary-500/20 ring-2 ring-primary-500 z-50 rotate-2" : ""
                                        )}
                                        onClick={() => { setEditingTask(task); setIsTaskModalOpen(true) }}
                                      >
                                      <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-mono text-dark-400 bg-dark-950 px-1 rounded">{task.key}</span>
                                        <div className="flex gap-1 items-center">
                                          <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded border tracking-wider uppercase', colors.bg, colors.text, colors.border)}>
                                            {task.priority}
                                          </span>
                                          <button onClick={(e) => handleDeleteTask(task.id, e)} className="opacity-0 group-hover:opacity-100 text-dark-500 hover:text-rose-400 p-0.5 transition-opacity"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                      </div>
                                      <h4 className="text-sm font-semibold text-white mb-2 leading-tight">{task.content}</h4>
                                      <div className="flex justify-between items-center mt-auto pt-2 border-t border-dark-800/50">
                                        <div className="text-[10px] text-dark-400 truncate w-24">
                                          {projects.find(p => p.id === task.projectId)?.name || 'Unknown'}
                                        </div>
                                        <div className={cn("text-[10px] font-bold flex items-center gap-1", isUrgent ? 'text-rose-400 animate-pulse' : 'text-amber-400')}>
                                          <CalendarIcon className="w-3 h-3" />
                                          {daysLeft < 0 ? 'Overdue' : daysLeft === 0 ? 'Today' : `${daysLeft}d`}
                                        </div>
                                      </div>
                                      </motion.div>
                                    </div>
                                  )}
                                </Draggable>
                              )
                            })}
                          </AnimatePresence>
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                )
              })}
            </div>
          </DragDropContext>
        </div>

        {/* COLUMN 3: REAL-TIME CALENDAR (4/12) */}
        <div className="xl:col-span-4 glass-panel rounded-2xl border border-dark-800 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-dark-800/50 flex justify-between items-center bg-dark-900/40">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-rose-400" />
              Real-Time Deadlines
            </h2>
            <div className="flex gap-1">
              <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-1 hover:bg-dark-800 rounded text-dark-300 hover:text-white"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-1 hover:bg-dark-800 rounded text-dark-300 hover:text-white"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
          
          <div className="p-4 text-center text-sm font-bold text-white">
            {new Date(year, month).toLocaleString('default', { month: 'long' })} {year}
          </div>

          <div className="flex-1 p-4 pt-0 flex flex-col min-h-0">
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-dark-400 uppercase tracking-wider mb-2">
              <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
            </div>
            
            <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-1">
              {gridCells.map((cell, idx) => {
                const dayTasks = dateTasksMap[cell.dateString] || []
                const isToday = cell.dateString === new Date().toISOString().split('T')[0]
                const hasUrgent = dayTasks.some(t => calculateDaysRemaining(t.dueDate) <= 2 && t.status !== 'DONE')

                return (
                  <div
                    key={idx}
                    className={cn(
                      "relative rounded-lg border p-1 flex flex-col items-center hover:bg-dark-800/50 transition-colors cursor-pointer overflow-hidden group",
                      cell.isCurrentMonth ? "bg-dark-900/30 border-dark-800/50" : "bg-dark-950/20 border-transparent opacity-40",
                      isToday ? "ring-1 ring-primary-500 bg-primary-900/10" : ""
                    )}
                    onClick={() => { setEditingTask({ dueDate: cell.dateString, projectId: selectedProjectId !== 'ALL' ? selectedProjectId : undefined }); setIsTaskModalOpen(true) }}
                  >
                    <span className={cn("text-[10px] font-semibold w-5 h-5 flex items-center justify-center rounded-full mb-1", isToday ? "bg-primary-500 text-white" : "text-dark-300")}>
                      {cell.dayNum}
                    </span>
                    
                    {/* Task Indicators */}
                    <div className="flex flex-wrap justify-center gap-0.5 w-full">
                      {dayTasks.map(t => {
                        const colors = priorityColors[t.priority] || priorityColors.MEDIUM
                        return (
                          <div 
                            key={t.id} 
                            className={cn("w-1.5 h-1.5 rounded-full", colors.bg.replace('/10', ''))} 
                            title={t.content}
                          />
                        )
                      })}
                    </div>

                    {/* Urgent Glow */}
                    {hasUrgent && <div className="absolute inset-0 ring-1 ring-inset ring-rose-500/30 animate-pulse rounded-lg pointer-events-none" />}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <ProjectModal 
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={handleSaveProject}
        onDelete={(id) => dispatch(deleteProject(id))}
        initialData={editingProject}
      />

      <TaskModal 
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={(id) => dispatch(deleteTask(id))}
        initialData={editingTask}
        columns={columns}
      />
    </div>
  )
}
