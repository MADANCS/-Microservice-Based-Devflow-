import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { MessageSquare, AlignLeft, Calendar as CalendarIcon, Plus, Briefcase } from 'lucide-react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { TaskModal } from '../components/TaskModal'
import type { TaskFormData } from '../components/TaskModal'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../store/store'
import { addTask, updateTask, deleteTask, updateTaskStatus } from '../store/workspaceSlice'
import { setActivePanelTaskId } from '../store/sprintSlice'

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs))
}

const PriorityBadge = ({ priority }: { priority: string }) => {
  const colors: Record<string, string> = {
    CRITICAL: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    HIGH:     'bg-amber-500/10 text-amber-500 border-amber-500/20',
    MEDIUM:   'bg-blue-500/10 text-blue-500 border-blue-500/20',
    LOW:      'bg-slate-500/10 text-slate-400 border-slate-500/20',
  }
  return (
    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider', colors[priority])}>
      {priority}
    </span>
  )
}

export const Board = () => {
  const dispatch = useDispatch<any>()
  const projects = useSelector((state: RootState) => state.workspace.projects)
  const allTasks = useSelector((state: RootState) => state.workspace.tasks)
  const workspaceStatus = useSelector((state: RootState) => state.workspace.status)
  const workspaceError = useSelector((state: RootState) => state.workspace.error)

  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Partial<TaskFormData> | undefined>()
  const [targetColumn, setTargetColumn] = useState<string | undefined>()

  // Set default selected project when projects load
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id)
    }
  }, [projects, selectedProjectId])

  const currentProject = projects.find(p => p.id === selectedProjectId)
  const projectTasks = allTasks.filter(t => t.projectId === selectedProjectId)

  const columns = {
    'TODO': {
      id: 'TODO',
      title: 'To Do',
      tasks: projectTasks.filter(t => t.status === 'TODO')
    },
    'IN_PROGRESS': {
      id: 'IN_PROGRESS',
      title: 'In Progress',
      tasks: projectTasks.filter(t => t.status === 'IN_PROGRESS')
    },
    'IN_REVIEW': {
      id: 'IN_REVIEW',
      title: 'In Review',
      tasks: projectTasks.filter(t => t.status === 'IN_REVIEW')
    },
    'DONE': {
      id: 'DONE',
      title: 'Done',
      tasks: projectTasks.filter(t => t.status === 'DONE')
    }
  }

  const columnOrder = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as const

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    dispatch(updateTaskStatus({
      taskId: draggableId,
      status: destination.droppableId as any
    }))
  }

  const handleSaveTask = (taskData: TaskFormData) => {
    if (taskData.id) {
      const existing = allTasks.find(t => t.id === taskData.id)
      if (existing) {
        dispatch(updateTask({
          ...existing,
          content: taskData.content,
          description: taskData.description,
          points: taskData.points,
          priority: taskData.priority,
          dueDate: taskData.dueDate
        }))
      }
    } else {
      dispatch(addTask({
        content: taskData.content,
        description: taskData.description,
        points: taskData.points,
        priority: taskData.priority,
        dueDate: taskData.dueDate,
        status: (taskData.columnId || 'TODO') as any,
        projectId: selectedProjectId
      }))
    }
  }

  const handleDeleteTask = (id: string) => {
    dispatch(deleteTask(id))
  }

  const openNewTaskModal = (columnId?: string) => {
    setEditingTask(undefined)
    setTargetColumn(columnId)
    setIsModalOpen(true)
  }

  const openEditModal = (task: typeof allTasks[0]) => {
    setEditingTask({
      id: task.id,
      content: task.content,
      description: task.description,
      points: task.points,
      priority: task.priority,
      dueDate: task.dueDate,
      columnId: task.status
    })
    setIsModalOpen(true)
  }

  const formatDate = (dateString: string) => {
    const d = new Date(dateString)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (workspaceStatus === 'loading' && projects.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-dark-400">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p>Loading board...</p>
      </div>
    )
  }

  if (workspaceStatus === 'failed' && projects.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-rose-400 bg-rose-500/10 rounded-xl border border-rose-500/20 m-8 p-8 text-center">
        <p className="font-semibold mb-1">Failed to load board</p>
        <p className="text-sm">{workspaceError || 'Backend service unreachable.'}</p>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <Briefcase className="w-16 h-16 text-dark-500 mb-4 stroke-[1.5]" />
        <h2 className="text-xl font-semibold text-white mb-2">No Projects Available</h2>
        <p className="text-dark-400 max-w-sm mb-6">Create a project first in order to manage sprints and tasks.</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Sprint Board</h1>
            
            {/* Project Selector */}
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-dark-900 border border-dark-700 text-dark-100 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary-500 font-medium"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.key})</option>
              ))}
            </select>
          </div>
          <p className="text-dark-400 text-sm mt-1">
            Project Code: <span className="font-mono text-primary-400 font-semibold">{currentProject?.key}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => openNewTaskModal()} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 h-full items-start min-w-max">
            {columnOrder.map((columnId) => {
              const col = columns[columnId]
              const tasks = col.tasks

              return (
                <div key={col.id} className="w-80 flex flex-col max-h-full">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="font-semibold text-dark-200">{col.title}</h2>
                    <span className="bg-dark-800 text-dark-400 text-xs py-0.5 px-2 rounded-full font-medium">
                      {tasks.length}
                    </span>
                  </div>

                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          'flex-1 overflow-y-auto p-2 rounded-xl transition-colors min-h-[250px] flex flex-col max-h-[calc(100vh-270px)]',
                          snapshot.isDraggingOver
                            ? 'bg-dark-800/50 border border-primary-500/30 border-dashed'
                            : 'bg-dark-900/30 border border-transparent'
                        )}
                      >
                        {tasks.map((task, index) => {
                          const isOverdue = new Date(task.dueDate) < new Date() && col.id !== 'DONE'
                          return (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => dispatch(setActivePanelTaskId(task.id))}
                                  className={cn(
                                    'mb-3 p-4 rounded-xl glass-card text-left select-none cursor-pointer group hover:ring-1 hover:ring-primary-500/40',
                                    snapshot.isDragging && 'shadow-2xl shadow-primary-500/20 ring-1 ring-primary-500/50 opacity-90 rotate-1 scale-[1.02]'
                                  )}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-mono text-dark-400 bg-dark-900 px-1.5 py-0.5 rounded">{task.key}</span>
                                  </div>

                                  <h3 className="text-sm font-medium text-white mb-2 line-clamp-2">{task.content}</h3>
                                  
                                  {task.description && (
                                    <p className="text-xs text-dark-400 mb-3 line-clamp-2 leading-relaxed">{task.description}</p>
                                  )}

                                  <div className="flex flex-wrap items-center gap-2 mb-4">
                                    <PriorityBadge priority={task.priority} />
                                    <div className={cn(
                                      "flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded",
                                      isOverdue ? "text-rose-400 bg-rose-500/10 border border-rose-500/20" : "text-dark-400 bg-dark-800"
                                    )}>
                                      <CalendarIcon className="w-3 h-3" />
                                      {formatDate(task.dueDate)}
                                    </div>
                                  </div>

                                  <div className="flex justify-between items-center text-dark-400 text-xs border-t border-dark-700/50 pt-3">
                                    <div className="flex gap-3">
                                      {task.comments > 0 && (
                                        <div className="flex items-center gap-1">
                                          <MessageSquare className="w-3 h-3" />
                                          <span>{task.comments}</span>
                                        </div>
                                      )}
                                      <AlignLeft className="w-3 h-3" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] border border-indigo-500/30">
                                        {task.points}
                                      </div>
                                      <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${task.id}`} className="w-6 h-6 rounded-full bg-dark-800 border border-dark-700" alt="Assignee" />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          )
                        })}
                        {provided.placeholder}
                        
                        <button 
                          onClick={() => openNewTaskModal(col.id)}
                          className="mt-2 flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-dark-700 text-dark-400 hover:text-white hover:border-dark-500 hover:bg-dark-800/30 transition-all cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span className="text-sm font-medium">Add Task</span>
                        </button>
                      </div>
                    )}
                  </Droppable>
                </div>
              )
            })}
          </div>
        </DragDropContext>
      </div>

      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        initialData={editingTask || { columnId: targetColumn }}
        columns={columnOrder.map(id => ({ id, title: columns[id].title }))}
      />
    </div>
  )
}
