import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

export interface TeamMember {
  id: string
  name: string
  email: string
  role: 'OWNER' | 'ADMIN' | 'DEVELOPER' | 'DESIGNER' | 'VIEWER'
  status: 'ONLINE' | 'AWAY' | 'OFFLINE'
  avatar: string
  avatarGradient: string
  joinedDate: string
  skills: string[]
  projectsAssigned: string[]
  tasksAssigned: string[]
}

export interface ActivityLog {
  id: string
  type: 'MEMBER_ADDED' | 'MEMBER_UPDATED' | 'MEMBER_DELETED' | 'TASK_ASSIGNED' | 'PROJECT_CREATED'
  message: string
  timestamp: string
}

interface TeamState {
  members: TeamMember[]
  activities: ActivityLog[]
  searchQuery: string
  filterStatus: 'ALL' | 'ONLINE' | 'AWAY' | 'OFFLINE'
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialMembers: TeamMember[] = [
  {
    id: 'mem_1',
    name: 'Alex Developer',
    email: 'alex@devflow.io',
    role: 'OWNER',
    status: 'ONLINE',
    avatar: 'AD',
    avatarGradient: 'from-blue-600 to-indigo-600',
    joinedDate: '2026-01-10',
    skills: ['React', 'TypeScript', 'Spring Boot', 'Tailwind'],
    projectsAssigned: ['p1', 'p2'],
    tasksAssigned: ['t1', 't2', 't3']
  },
  {
    id: 'mem_2',
    name: 'Sarah Designer',
    email: 'sarah@devflow.io',
    role: 'DESIGNER',
    status: 'ONLINE',
    avatar: 'SD',
    avatarGradient: 'from-purple-600 to-pink-600',
    joinedDate: '2026-02-01',
    skills: ['Figma', 'UI/UX', 'Tailwind', 'Motion'],
    projectsAssigned: ['p1'],
    tasksAssigned: ['t4']
  },
  {
    id: 'mem_3',
    name: 'Michael Backend',
    email: 'michael@devflow.io',
    role: 'DEVELOPER',
    status: 'AWAY',
    avatar: 'MB',
    avatarGradient: 'from-emerald-500 to-teal-600',
    joinedDate: '2026-02-15',
    skills: ['Java', 'Spring Cloud', 'PostgreSQL', 'Redis'],
    projectsAssigned: ['p2'],
    tasksAssigned: ['t5', 't6']
  },
  {
    id: 'mem_4',
    name: 'Elena Admin',
    email: 'elena@devflow.io',
    role: 'ADMIN',
    status: 'OFFLINE',
    avatar: 'EA',
    avatarGradient: 'from-amber-500 to-orange-600',
    joinedDate: '2026-03-01',
    skills: ['DevOps', 'Docker', 'Kubernetes', 'Security'],
    projectsAssigned: [],
    tasksAssigned: []
  }
]

const initialActivities: ActivityLog[] = [
  {
    id: 'act_1',
    type: 'MEMBER_ADDED',
    message: 'Alex Developer initialized the team workspace.',
    timestamp: '10 mins ago'
  },
  {
    id: 'act_2',
    type: 'PROJECT_CREATED',
    message: 'New project "DevFlow Platform" created.',
    timestamp: '25 mins ago'
  }
]

const initialState: TeamState = {
  members: initialMembers,
  activities: initialActivities,
  searchQuery: '',
  filterStatus: 'ALL',
  status: 'idle',
  error: null
}

export const fetchTeamMembers = createAsyncThunk(
  'team/fetchTeamMembers',
  async (searchQuery: string = '', { rejectWithValue }) => {
    try {
      const response = await api.get(`/team/members${searchQuery ? `?search=${searchQuery}` : ''}`)
      const data = response.data?.data ?? response.data
      return Array.isArray(data) ? (data as TeamMember[]) : []
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? err.message)
    }
  }
)

export const addTeamMember = createAsyncThunk(
  'team/addTeamMember',
  async (memberData: Omit<TeamMember, 'id' | 'avatar' | 'avatarGradient' | 'joinedDate'>, { rejectWithValue }) => {
    try {
      const response = await api.post('/team/members', memberData)
      return (response.data?.data ?? response.data) as TeamMember
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? err.message)
    }
  }
)

export const updateTeamMember = createAsyncThunk(
  'team/updateTeamMember',
  async (member: Partial<TeamMember> & { id: string }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/team/members/${member.id}`, member)
      return (response.data?.data ?? response.data) as TeamMember
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? err.message)
    }
  }
)

export const deleteTeamMember = createAsyncThunk(
  'team/deleteTeamMember',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/team/members/${id}`)
      return id
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? err.message)
    }
  }
)

const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    setFilterStatus: (state, action: PayloadAction<'ALL' | 'ONLINE' | 'AWAY' | 'OFFLINE'>) => {
      state.filterStatus = action.payload
    },
    updateLocalMemberStatus: (state, action: PayloadAction<{ id: string; status: TeamMember['status'] }>) => {
      const m = state.members.find(item => item.id === action.payload.id)
      if (m) {
        m.status = action.payload.status
        state.activities.unshift({
          id: 'act_' + Date.now(),
          type: 'MEMBER_UPDATED',
          message: `${m.name} changed status to ${action.payload.status}.`,
          timestamp: 'Just now'
        })
      }
    },
    updateLocalMemberAssignments: (state, action: PayloadAction<{ id: string; projectsAssigned: string[]; tasksAssigned: string[] }>) => {
      const m = state.members.find(item => item.id === action.payload.id)
      if (m) {
        m.projectsAssigned = action.payload.projectsAssigned
        m.tasksAssigned = action.payload.tasksAssigned
        state.activities.unshift({
          id: 'act_' + Date.now(),
          type: 'TASK_ASSIGNED',
          message: `Updated task & project assignments for ${m.name}.`,
          timestamp: 'Just now'
        })
      }
    },
    addActivityLog: (state, action: PayloadAction<{ type: ActivityLog['type']; message: string }>) => {
      state.activities.unshift({
        id: 'act_' + Date.now(),
        type: action.payload.type,
        message: action.payload.message,
        timestamp: 'Just now'
      })
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTeamMembers.fulfilled, (state, action) => {
      if (action.payload && action.payload.length > 0) {
        state.members = action.payload
      }
    })

    builder.addCase(addTeamMember.fulfilled, (state, action) => {
      state.members.unshift(action.payload)
      state.activities.unshift({
        id: 'act_' + Date.now(),
        type: 'MEMBER_ADDED',
        message: `New team member ${action.payload.name} (${action.payload.role}) joined the team.`,
        timestamp: 'Just now'
      })
    })

    builder.addCase(updateTeamMember.fulfilled, (state, action) => {
      const idx = state.members.findIndex(m => m.id === action.payload.id)
      if (idx !== -1) {
        state.members[idx] = action.payload
      }
      state.activities.unshift({
        id: 'act_' + Date.now(),
        type: 'MEMBER_UPDATED',
        message: `Updated details for member ${action.payload.name}.`,
        timestamp: 'Just now'
      })
    })

    builder.addCase(deleteTeamMember.fulfilled, (state, action) => {
      const deletedMember = state.members.find(m => m.id === action.payload)
      state.members = state.members.filter(m => m.id !== action.payload)
      state.activities.unshift({
        id: 'act_' + Date.now(),
        type: 'MEMBER_DELETED',
        message: `Member ${deletedMember?.name || action.payload} was removed from the team.`,
        timestamp: 'Just now'
      })
    })
  }
})

export const {
  setSearchQuery,
  setFilterStatus,
  updateLocalMemberStatus,
  updateLocalMemberAssignments,
  addActivityLog
} = teamSlice.actions

export default teamSlice.reducer
