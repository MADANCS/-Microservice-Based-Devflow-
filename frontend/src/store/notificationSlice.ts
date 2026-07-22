import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: string
  read: boolean
  actionLabel?: string
  actionPath?: string
}

export interface ToastNotification {
  id: string
  type: NotificationType
  title: string
  message: string
}

interface NotificationState {
  notifications: Notification[]
  toasts: ToastNotification[]
}

const initialNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'warning',
    title: 'Task Overdue',
    message: 'DEVF-43 "Implement WebSocket STOMP client" is past its due date.',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    read: false,
    actionLabel: 'View Task',
    actionPath: '/tasks',
  },
  {
    id: 'notif-2',
    type: 'success',
    title: 'Sprint Goal Reached',
    message: 'Sprint 6 has hit 80% completion. Great team effort!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
    actionLabel: 'View Analytics',
    actionPath: '/analytics',
  },
  {
    id: 'notif-3',
    type: 'info',
    title: 'New Comment',
    message: 'Sarah left a comment on DEVF-42 "Design new landing page".',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    read: true,
  },
  {
    id: 'notif-4',
    type: 'info',
    title: 'AI Insight Ready',
    message: 'A new AI risk analysis for DevFlow Core is available.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
    actionLabel: 'View Insights',
    actionPath: '/ai-insights',
  },
]

const initialState: NotificationState = {
  notifications: initialNotifications,
  toasts: [],
}

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
      state.notifications.unshift({
        ...action.payload,
        id: `notif-${Date.now()}`,
        timestamp: new Date().toISOString(),
        read: false,
      })
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const n = state.notifications.find(n => n.id === action.payload)
      if (n) n.read = true
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(n => { n.read = true })
    },
    deleteNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    pushToast: (state, action: PayloadAction<Omit<ToastNotification, 'id'>>) => {
      const toastId = `toast-${Date.now()}`
      state.toasts.push({ ...action.payload, id: toastId })
      state.notifications.unshift({
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: action.payload.type,
        title: action.payload.title,
        message: action.payload.message,
        timestamp: new Date().toISOString(),
        read: false,
        actionPath: '/projects'
      })
    },
    dismissToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(t => t.id !== action.payload)
    },
  },
})

export const { addNotification, markAsRead, markAllAsRead, deleteNotification, pushToast, dismissToast } =
  notificationSlice.actions

export default notificationSlice.reducer
