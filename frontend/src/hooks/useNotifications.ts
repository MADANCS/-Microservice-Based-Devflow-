import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { Client, type IFrame, type IMessage } from '@stomp/stompjs'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../store/store'
import {
  addNotification, pushToast, markAsRead, markAllAsRead, deleteNotification as removeReduxNotif
} from '../store/notificationSlice'
import type { NotificationPayload, NotificationPage, KafkaNotificationEvent } from '../types'

const WS_URL             = import.meta.env.VITE_WS_URL  || '/ws'
const API_BASE           = import.meta.env.VITE_API_URL || '/api/v1'
const RECONNECT_DELAY_MS = 5000
const MARK_READ_DEBOUNCE = 800
const PAGE_SIZE          = 15

function debounce<T extends (...args: Parameters<T>) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null
  const debounced = (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
  return debounced as T
}

let audioCtx: AudioContext | null = null
function playNotificationSound() {
  try {
    if (!audioCtx) audioCtx = new AudioContext()
    const osc  = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.connect(gain); gain.connect(audioCtx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, audioCtx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.15)
    gain.gain.setValueAtTime(0.07, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3)
    osc.start(audioCtx.currentTime)
    osc.stop(audioCtx.currentTime + 0.3)
  } catch { /* AudioContext blocked — silently ignore */ }
}

export interface UseNotificationsReturn {
  notifications: NotificationPayload[]
  unreadCount:   number
  isConnected:   boolean
  isLoading:     boolean
  hasMore:       boolean
  loadMore:      () => void
  markRead:      (id: string) => void
  markAllRead:   () => void
  deleteNotification: (id: string) => void
}

export const useNotifications = (userId: string): UseNotificationsReturn => {
  const dispatch = useDispatch<any>()
  const reduxNotifs = useSelector((state: RootState) => state.notifications.notifications)
  
  const stompRef      = useRef<Client | null>(null)
  const pendingReads  = useRef<Set<string>>(new Set())
  const pageRef       = useRef(0)
  const isMounted     = useRef(true)

  const [remoteNotifications, setRemoteNotifications] = useState<NotificationPayload[]>([])
  const [isConnected,   setIsConnected]   = useState(false)
  const [isLoading,     setIsLoading]     = useState(false)
  const [hasMore,       setHasMore]       = useState(false)

  // Map Redux notifications into NotificationPayload format
  const mappedReduxNotifications = useMemo<NotificationPayload[]>(() => {
    return reduxNotifs.map(n => ({
      id: n.id,
      type: n.type === 'warning' ? 'DEADLINE_APPROACHING' : n.type === 'success' ? 'SPRINT_STARTED' : 'STATUS_CHANGED',
      title: n.title,
      message: n.message,
      actorName: 'DevFlow Team',
      actorAvatar: null,
      resourceId: n.id,
      resourceType: 'PROJECT',
      resourcePath: n.actionPath || '/projects',
      timestamp: n.timestamp,
      read: n.read,
    }))
  }, [reduxNotifs])

  // Combined notifications: Redux first, then remote/socket notifications
  const combinedNotifications = useMemo(() => {
    const map = new Map<string, NotificationPayload>()
    mappedReduxNotifications.forEach(n => map.set(n.id, n))
    remoteNotifications.forEach(n => {
      if (!map.has(n.id)) map.set(n.id, n)
    })
    return Array.from(map.values())
  }, [mappedReduxNotifications, remoteNotifications])

  // REST: load page from gateway
  const fetchPage = useCallback(async (page: number) => {
    if (!isMounted.current) return
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res   = await fetch(
        `${API_BASE}/notifications?page=${page}&size=${PAGE_SIZE}`,
        { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(5000) }
      )
      if (!res.ok) throw new Error('Not OK')
      const data: NotificationPage = await res.json()
      if (!isMounted.current) return
      setRemoteNotifications(prev => page === 0 ? data.content : [...prev, ...data.content])
      setHasMore(data.hasMore)
      pageRef.current = page
    } catch {
      setHasMore(false)
    } finally {
      if (isMounted.current) setIsLoading(false)
    }
  }, [])

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) fetchPage(pageRef.current + 1)
  }, [isLoading, hasMore, fetchPage])

  const flushMarkRead = useCallback(
    debounce(async () => {
      if (pendingReads.current.size === 0) return
      const ids = [...pendingReads.current]
      pendingReads.current.clear()
      try {
        const token = localStorage.getItem('token')
        await fetch(`${API_BASE}/notifications/read`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ids }),
          signal: AbortSignal.timeout(5000),
        })
      } catch { /* no-op */ }
    }, MARK_READ_DEBOUNCE),
    []
  )

  const markRead = useCallback((id: string) => {
    dispatch(markAsRead(id))
    setRemoteNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    pendingReads.current.add(id)
    flushMarkRead()
  }, [dispatch, flushMarkRead])

  const markAllRead = useCallback(async () => {
    dispatch(markAllAsRead())
    setRemoteNotifications(prev => prev.map(n => ({ ...n, read: true })))
    try {
      const token = localStorage.getItem('token')
      await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(5000),
      })
    } catch { /* no-op */ }
  }, [dispatch])

  const deleteNotification = useCallback(async (id: string) => {
    dispatch(removeReduxNotif(id))
    setRemoteNotifications(prev => prev.filter(n => n.id !== id))
    try {
      const token = localStorage.getItem('token')
      await fetch(`${API_BASE}/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(5000),
      })
    } catch { /* no-op */ }
  }, [dispatch])

  // WebSocket: STOMP over SockJS
  useEffect(() => {
    if (!userId) return
    isMounted.current = true

    let client: Client

    const connect = async () => {
      try {
        const SockJS = (await import('sockjs-client')).default
        client = new Client({
          webSocketFactory: () => new SockJS(WS_URL) as WebSocket,
          reconnectDelay:   RECONNECT_DELAY_MS,
          onConnect: (_: IFrame) => {
            if (!isMounted.current) return
            setIsConnected(true)
            client.subscribe(`/topic/notifications/${userId}`, (msg: IMessage) => {
              if (!isMounted.current) return
              try {
                const event: KafkaNotificationEvent = JSON.parse(msg.body)
                const notif = event.payload
                setRemoteNotifications(prev => [notif, ...prev])
                dispatch(pushToast({
                  type:    notif.type === 'DEADLINE_APPROACHING' ? 'warning' : 'info',
                  title:   notif.title,
                  message: notif.message,
                }))
                dispatch(addNotification({
                  type: 'info', title: notif.title, message: notif.message,
                  actionLabel: notif.resourcePath ? 'View' : undefined,
                  actionPath:  notif.resourcePath ?? undefined,
                }))
                playNotificationSound()
              } catch { /* malformed WS message */ }
            })
            fetchPage(0)
          },
          onDisconnect: () => { if (isMounted.current) setIsConnected(false) },
          onStompError: () => { if (isMounted.current) setIsConnected(false) },
        })
        stompRef.current = client
        client.activate()
      } catch {
        setIsConnected(false)
      }
    }

    connect()

    return () => {
      isMounted.current = false
      stompRef.current?.deactivate()
      stompRef.current = null
    }
  }, [userId, dispatch, fetchPage])

  const unreadCount = combinedNotifications.filter(n => !n.read).length

  return {
    notifications: combinedNotifications,
    unreadCount,
    isConnected,
    isLoading,
    hasMore,
    loadMore,
    markRead,
    markAllRead,
    deleteNotification
  }
}
