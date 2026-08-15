import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'

import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Prevent wiping local workspace session on transient 401 backend failures
    if (error.response?.status === 401 && error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('token')
    }
    return Promise.reject(error)
  }
)

export interface ProjectSettings {
  visibility: 'PUBLIC' | 'PRIVATE' | 'INTERNAL'
  defaultPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  defaultStatus: 'TODO' | 'IN_PROGRESS'
  wipLimit: number
  archived: boolean
  allowMemberInvites: boolean
}

export interface Project {
  id: string
  name: string
  key: string
  description: string
  startDate: string
  endDate: string
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED'
  settings?: ProjectSettings
}

export interface Task {
  id: string
  key: string
  content: string
  description: string
  points: number
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  dueDate: string
  comments: number
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE'
  projectId: string
}

interface WorkspaceState {
  projects: Project[]
  tasks: Task[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialProjects: Project[] = [
  {
    id: 'proj_1',
    name: 'DevFlow Core Platform',
    key: 'DEVF',
    description: 'Next-generation developer workflow automation engine with Spring Boot microservices.',
    startDate: '2026-01-15',
    endDate: '2026-08-30',
    status: 'ACTIVE'
  },
  {
    id: 'proj_2',
    name: 'Mobile App Redesign',
    key: 'MOBI',
    description: 'React Native cross-platform workspace management application.',
    startDate: '2026-02-01',
    endDate: '2026-09-15',
    status: 'ACTIVE'
  },
  {
    id: 'proj_3',
    name: 'AI Engine Integration',
    key: 'AIENG',
    description: 'Automated sprint risk forecasting and Standup report generation.',
    startDate: '2026-03-10',
    endDate: '2026-10-01',
    status: 'PLANNING'
  }
]

const initialTasks: Task[] = [
  {
    id: 'task_1',
    key: 'DEVF-101',
    content: 'Implement JWT Authentication & Gateway Filters',
    description: 'Secure all microservice routes using Spring Cloud Gateway HMAC-SHA256 tokens.',
    points: 5,
    priority: 'CRITICAL',
    dueDate: '2026-07-25',
    comments: 4,
    status: 'DONE',
    projectId: 'proj_1'
  },
  {
    id: 'task_2',
    key: 'DEVF-102',
    content: 'Build Team Management REST APIs & UI Module',
    description: 'Full CRUD operations for team members, search, activity logs, and assignments.',
    points: 8,
    priority: 'HIGH',
    dueDate: '2026-07-28',
    comments: 2,
    status: 'IN_PROGRESS',
    projectId: 'proj_1'
  },
  {
    id: 'task_3',
    key: 'MOBI-201',
    content: 'Design Dark Mode Glassmorphism Theme',
    description: 'Tailwind CSS dark palette with smooth micro-animations.',
    points: 3,
    priority: 'MEDIUM',
    dueDate: '2026-08-05',
    comments: 1,
    status: 'TODO',
    projectId: 'proj_2'
  },
  {
    id: 'task_4',
    key: 'AIENG-301',
    content: 'Train Velocity Forecasting Model',
    description: 'Analyze historical sprint velocity points to predict completion dates.',
    points: 13,
    priority: 'HIGH',
    dueDate: '2026-08-12',
    comments: 0,
    status: 'TODO',
    projectId: 'proj_3'
  }
]

function getCurrentUserId(): string {
  try {
    const raw = localStorage.getItem('devflow_session')
    if (raw) {
      const u = JSON.parse(raw)
      return u?.id || u?.email || 'default_user'
    }
  } catch {}
  return 'default_user'
}

function getUserStorageKey(userId: string): string {
  return `devflow_workspace_${userId}`
}

export function loadUserWorkspace(userId?: string): { projects: Project[]; tasks: Task[] } {
  const uid = userId || getCurrentUserId()
  try {
    const key = getUserStorageKey(uid)
    const raw = localStorage.getItem(key)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed.projects) && Array.isArray(parsed.tasks)) {
        return parsed
      }
    }
  } catch {}

  const userProjects: Project[] = initialProjects.map(p => ({ ...p, id: `proj_${uid}_${p.id}` }))
  const userTasks: Task[] = initialTasks.map(t => ({ ...t, id: `task_${uid}_${t.id}`, projectId: `proj_${uid}_${t.projectId}` }))
  const data = { projects: userProjects, tasks: userTasks }
  try {
    localStorage.setItem(getUserStorageKey(uid), JSON.stringify(data))
  } catch {}
  return data
}

export function saveUserWorkspace(projects: Project[], tasks: Task[], userId?: string) {
  const uid = userId || getCurrentUserId()
  try {
    localStorage.setItem(getUserStorageKey(uid), JSON.stringify({ projects, tasks }))
  } catch {}
}

const initialWorkspaceData = loadUserWorkspace()

const initialState: WorkspaceState = {
  projects: initialWorkspaceData.projects,
  tasks: initialWorkspaceData.tasks,
  status: 'idle',
  error: null
}

function mapProject(raw: any): Project {
  return {
    id:          raw.id          || `proj_${Date.now()}`,
    name:        raw.name        || 'New Project',
    key:         raw.key         || 'DEVF',
    description: raw.description || '',
    startDate:   raw.startDate      ? raw.startDate.split('T')[0]      : new Date().toISOString().split('T')[0],
    endDate:     raw.targetEndDate  ? raw.targetEndDate.split('T')[0]  : (raw.endDate ?? new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]),
    status:      raw.status         || 'ACTIVE',
  }
}

function mapTask(raw: any): Task {
  return {
    id:          raw.id          || `task_${Date.now()}`,
    key:         raw.key         || 'DEVF-10',
    content:     raw.title       || raw.content     || 'New Task',
    description: raw.description || '',
    points:      raw.storyPoints || raw.points       || 1,
    priority:    raw.priority    || 'MEDIUM',
    dueDate:     raw.dueDate     ? raw.dueDate.split('T')[0] : new Date().toISOString().split('T')[0],
    comments:    raw.commentCount || raw.comments   || 0,
    status:      raw.status      || 'TODO',
    projectId:   raw.projectId   || 'proj_1',
  }
}

function unwrapList(responseData: any): any[] {
  const data = responseData?.data ?? responseData
  if (Array.isArray(data?.content)) return data.content
  if (Array.isArray(data))          return data
  return []
}

export const fetchProjects = createAsyncThunk(
  'workspace/fetchProjects',
  async (_, { getState, rejectWithValue }) => {
    try {
      const response = await api.get('/projects')
      const raw = unwrapList(response.data)
      if (raw && raw.length > 0) {
        return raw.map(mapProject) as Project[]
      }
      const saved = loadUserWorkspace().projects
      const state: any = getState()
      const currentProjects = state?.workspace?.projects || []
      return currentProjects.length > saved.length ? currentProjects : saved
    } catch (err: any) {
      const saved = loadUserWorkspace().projects
      const state: any = getState()
      const currentProjects = state?.workspace?.projects || []
      return currentProjects.length > saved.length ? currentProjects : saved
    }
  }
)


export const addProject = createAsyncThunk(
  'workspace/addProject',
  async (project: Omit<Project, 'id'>, { rejectWithValue }) => {
    try {
      const payload = {
        name:          project.name,
        key:           project.key,
        description:   project.description,
        visibility:    'PRIVATE',
        startDate:     project.startDate     || undefined,
        targetEndDate: project.endDate       || undefined,
      }
      const response = await api.post('/projects', payload)
      return mapProject(response.data?.data ?? response.data)
    } catch (err: any) {
      // Return optimistic project object on network/dev fallback
      return mapProject({
        ...project,
        id: `proj_${Date.now()}`,
      })
    }
  }
)

export const updateProject = createAsyncThunk(
  'workspace/updateProject',
  async (project: Project, { rejectWithValue }) => {
    try {
      const payload = {
        name:          project.name,
        description:   project.description,
        status:        project.status,
        targetEndDate: project.endDate || undefined,
      }
      const response = await api.put(`/projects/${project.id}`, payload)
      return mapProject(response.data?.data ?? response.data)
    } catch (err: any) {
      return project
    }
  }
)

export const deleteProject = createAsyncThunk(
  'workspace/deleteProject',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/projects/${id}`)
      return id
    } catch (err: any) {
      return id
    }
  }
)

export const updateProjectSettings = createAsyncThunk(
  'workspace/updateProjectSettings',
  async ({ projectId, settings }: { projectId: string; settings: Partial<ProjectSettings> }, { getState, rejectWithValue }) => {
    try {
      const response = await api.put(`/projects/${projectId}/settings`, settings)
      return { projectId, settings: response.data?.data ?? settings }
    } catch (err: any) {
      return { projectId, settings }
    }
  }
)

export const fetchTasks = createAsyncThunk(
  'workspace/fetchTasks',
  async (projectId: string, { getState, rejectWithValue }) => {
    try {
      const response = await api.get(`/tasks?projectId=${projectId}&size=200`)
      const raw = unwrapList(response.data)
      if (raw && raw.length > 0) {
        return { projectId, tasks: raw.map(mapTask) as Task[] }
      }
      const state: any = getState()
      const localTasks = state?.workspace?.tasks?.filter((t: Task) => t.projectId === projectId) || []
      return { projectId, tasks: localTasks }
    } catch (err: any) {
      const state: any = getState()
      const localTasks = state?.workspace?.tasks?.filter((t: Task) => t.projectId === projectId) || []
      return { projectId, tasks: localTasks }
    }
  }
)

export const addTask = createAsyncThunk(
  'workspace/addTask',
  async (taskData: Omit<Task, 'id' | 'key' | 'comments'>, { getState, rejectWithValue }) => {
    try {
      const state: any = getState()
      const project = state.workspace.projects.find((p: Project) => p.id === taskData.projectId)
      const projectKey = project?.key ?? 'DEVF'

      const payload = {
        title:       taskData.content,
        description: taskData.description,
        priority:    taskData.priority,
        storyPoints: taskData.points,
        dueDate:     taskData.dueDate ? `${taskData.dueDate}T00:00:00` : undefined,
        type:        'STORY'
      }
      const response = await api.post(
        `/projects/${taskData.projectId}/tasks?projectKey=${projectKey}`,
        payload
      )
      return mapTask(response.data?.data ?? response.data)
    } catch (err: any) {
      const state: any = getState()
      const existingCount = state.workspace.tasks.length + 1
      return mapTask({
        ...taskData,
        id: `task_${Date.now()}`,
        key: `DEVF-${existingCount + 100}`,
        comments: 0
      })
    }
  }
)

export const updateTask = createAsyncThunk(
  'workspace/updateTask',
  async (taskData: Task, { rejectWithValue }) => {
    try {
      const payload = {
        title:       taskData.content,
        description: taskData.description,
        priority:    taskData.priority,
        storyPoints: taskData.points,
        dueDate:     taskData.dueDate ? `${taskData.dueDate}T00:00:00` : undefined,
      }
      const response = await api.put(`/tasks/${taskData.id}`, payload)
      return mapTask(response.data?.data ?? response.data)
    } catch (err: any) {
      return taskData
    }
  }
)

export const updateTaskStatus = createAsyncThunk(
  'workspace/updateTaskStatus',
  async ({ taskId, status }: { taskId: string; status: string }, { rejectWithValue }) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status })
      return { taskId, status }
    } catch (err: any) {
      return { taskId, status }
    }
  }
)

export const deleteTask = createAsyncThunk(
  'workspace/deleteTask',
  async (taskId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${taskId}`)
      return taskId
    } catch (err: any) {
      return taskId
    }
  }
)

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null },
    reloadWorkspaceForUser: (state, action: PayloadAction<string | undefined>) => {

      const data = loadUserWorkspace(action.payload)
      state.projects = data.projects
      state.tasks = data.tasks
      state.status = 'succeeded'
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchProjects.pending, (state) => {
      state.status = 'loading'
      state.error  = null
    })
    builder.addCase(fetchProjects.fulfilled, (state, action) => {
      if (action.payload && action.payload.length > 0) {
        const existingIds = new Set(action.payload.map((p: Project) => p.id))
        const extraLocalProjects = state.projects.filter(p => !existingIds.has(p.id))
        state.projects = [...action.payload, ...extraLocalProjects]
        saveUserWorkspace(state.projects, state.tasks)
      }
      state.status = 'succeeded'
    })
    builder.addCase(fetchProjects.rejected, (state, action) => {
      state.status = 'failed'
      state.error  = action.payload as string
    })

    builder.addCase(addProject.fulfilled, (state, action) => {
      state.projects.unshift(action.payload)
      saveUserWorkspace(state.projects, state.tasks)
    })

    builder.addCase(updateProject.fulfilled, (state, action) => {
      state.projects = state.projects.map(p =>
        p.id === action.payload.id ? action.payload : p
      )
      saveUserWorkspace(state.projects, state.tasks)
    })

    builder.addCase(deleteProject.fulfilled, (state, action) => {
      state.projects = state.projects.filter(p => p.id !== action.payload)
      state.tasks    = state.tasks.filter(t => t.projectId !== action.payload)
      saveUserWorkspace(state.projects, state.tasks)
    })

    builder.addCase(updateProjectSettings.fulfilled, (state, action) => {
      const proj = state.projects.find(p => p.id === action.payload.projectId)
      if (proj) {
        proj.settings = { ...proj.settings, ...action.payload.settings } as any
      }
      saveUserWorkspace(state.projects, state.tasks)
    })

    builder.addCase(fetchTasks.fulfilled, (state, action) => {
      const { projectId, tasks } = action.payload
      if (tasks) {
        const existingTaskIds = new Set(tasks.map((t: Task) => t.id))
        const otherTasks = state.tasks.filter((t: Task) => t.projectId !== projectId)
        const localTasksForProj = state.tasks.filter((t: Task) => t.projectId === projectId && !existingTaskIds.has(t.id))
        state.tasks = [...otherTasks, ...tasks, ...localTasksForProj]
        saveUserWorkspace(state.projects, state.tasks)
      }
    })

    builder.addCase(addTask.fulfilled, (state, action) => {
      state.tasks.unshift(action.payload)
      saveUserWorkspace(state.projects, state.tasks)
    })

    builder.addCase(updateTask.fulfilled, (state, action) => {
      state.tasks = state.tasks.map(t =>
        t.id === action.payload.id ? action.payload : t
      )
      saveUserWorkspace(state.projects, state.tasks)
    })

    builder.addCase(updateTaskStatus.fulfilled, (state, action) => {
      const task = state.tasks.find(t => t.id === action.payload.taskId)
      if (task) task.status = action.payload.status as any
      saveUserWorkspace(state.projects, state.tasks)
    })

    builder.addCase(deleteTask.fulfilled, (state, action) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload)
      saveUserWorkspace(state.projects, state.tasks)
    })
  }
})

export const { clearError, reloadWorkspaceForUser } = workspaceSlice.actions
export default workspaceSlice.reducer

