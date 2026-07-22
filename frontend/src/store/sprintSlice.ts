import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface Sprint {
  id: string
  name: string
  goal: string
  projectId: string
  startDate: string
  endDate: string
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  taskIds: string[]
  velocity?: number
  sprintNumber: number
  plannedPoints: number
  completedPoints: number
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: 'OWNER' | 'ADMIN' | 'DEVELOPER' | 'DESIGNER' | 'VIEWER'
  avatar: string
  avatarGradient: string
  status: 'ONLINE' | 'AWAY' | 'OFFLINE'
  projectsAssigned: string[]
  tasksAssigned: string[]
  skills: string[]
  joinedDate: string
}

export interface TimeLog {
  id: string
  taskId: string
  memberId: string
  hours: number
  description: string
  loggedAt: string
}

interface SprintState {
  sprints: Sprint[]
  teamMembers: TeamMember[]
  timeLogs: TimeLog[]
  activePanelTaskId: string | null
}

const initialState: SprintState = {
  sprints:       [],   // Populated via backend API when sprint management is implemented
  teamMembers:   [],   // Populated from auth/user service
  timeLogs:      [],
  activePanelTaskId: null,
}

const sprintSlice = createSlice({
  name: 'sprint',
  initialState,
  reducers: {
    addSprint: (state, action: PayloadAction<Omit<Sprint, 'id'>>) => {
      state.sprints.unshift({ ...action.payload, id: `sprint-${Date.now()}` })
    },
    updateSprint: (state, action: PayloadAction<Sprint>) => {
      state.sprints = state.sprints.map(s => (s.id === action.payload.id ? action.payload : s))
    },
    completeSprint: (state, action: PayloadAction<string>) => {
      const s = state.sprints.find(s => s.id === action.payload)
      if (s) s.status = 'COMPLETED'
    },
    addTimeLog: (state, action: PayloadAction<Omit<TimeLog, 'id'>>) => {
      state.timeLogs.push({ ...action.payload, id: `log-${Date.now()}` })
    },
    updateMemberStatus: (state, action: PayloadAction<{ id: string; status: TeamMember['status'] }>) => {
      const m = state.teamMembers.find(m => m.id === action.payload.id)
      if (m) m.status = action.payload.status
    },
    updateMemberAssignments: (state, action: PayloadAction<{ id: string; projectsAssigned: string[]; tasksAssigned: string[] }>) => {
      const m = state.teamMembers.find(m => m.id === action.payload.id)
      if (m) {
        m.projectsAssigned = action.payload.projectsAssigned
        m.tasksAssigned = action.payload.tasksAssigned
      }
    },
    setActivePanelTaskId: (state, action: PayloadAction<string | null>) => {
      state.activePanelTaskId = action.payload
    },
  },
})

export const { addSprint, updateSprint, completeSprint, addTimeLog, updateMemberStatus, updateMemberAssignments, setActivePanelTaskId } =
  sprintSlice.actions

export default sprintSlice.reducer
