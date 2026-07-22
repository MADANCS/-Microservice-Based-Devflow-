import React, { useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCheck, Settings, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { NotificationItem } from './NotificationItem'
import { NotificationSkeleton } from '../Skeleton'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import type { NotificationPayload } from '../../types'

// Ã¢â€â‚¬Ã¢â€â‚¬ Empty state Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const EmptyNotifications = React.memo(() => (
  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
    <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
      <Bell className="w-5 h-5 text-slate-600" />
    </div>
    <p className="text-sm font-semibold text-white mb-1">All caught up! 🎉</p>

    <p className="text-xs text-slate-500 max-w-[180px]">No notifications yet. We'll let you know when something happens.</p>
  </div>
))
EmptyNotifications.displayName = 'EmptyNotifications'

// Ã¢â€â‚¬Ã¢â€â‚¬ Panel props Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
export interface NotificationPanelProps {
  notifications:  NotificationPayload[]
  unreadCount:    number
  isConnected:    boolean
  isLoading:      boolean
  hasMore:        boolean
  onLoadMore:     () => void
  onMarkRead:     (id: string) => void
  onMarkAllRead:  () => void
  onDelete:       (id: string) => void
  onClose:        () => void
}

// Ã¢â€â‚¬Ã¢â€â‚¬ NotificationPanel Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
export const NotificationPanel = React.memo(({
  notifications, unreadCount, isConnected,
  isLoading, hasMore,
  onLoadMore, onMarkRead, onMarkAllRead, onDelete, onClose,
}: NotificationPanelProps) => {
  const reduced   = useReducedMotion()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Infinite scroll detection
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handler = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40 && hasMore && !isLoading) {
        onLoadMore()
      }
    }
    el.addEventListener('scroll', handler, { passive: true })
    return () => el.removeEventListener('scroll', handler)
  }, [hasMore, isLoading, onLoadMore])

  const panels = {
    all:    notifications,
    unread: notifications.filter(n => !n.read),
  }

  const [activeTab, setActiveTab] = React.useState<'all' | 'unread'>('all')
  const displayList = panels[activeTab]

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, scale: 0.95, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={reduced ? undefined : { opacity: 0, scale: 0.95, y: -8 }}
      transition={{ type: 'spring' as const, stiffness: 300, damping: 28 }}
      role="dialog"
      aria-label="Notifications panel"
      aria-modal="false"
      className="absolute right-0 top-full mt-2 w-96 rounded-2xl overflow-hidden z-50 flex flex-col"
      style={{
        maxHeight: 520,
        background: 'rgb(7 11 22 / 0.98)',
        border: '1px solid rgb(51 65 85 / 0.5)',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 30px 60px -15px rgba(0,0,0,0.7), 0 0 0 1px rgb(97 218 251 / 0.04)',
      }}
    >
      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Header Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-800/60 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#61dafb]/15 text-[#61dafb] border border-[#61dafb]/20">
              {unreadCount} new
            </span>
          )}
          {/* WS connection indicator */}
          <div
            className={`flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
              isConnected
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-rose-500/10 text-rose-400'
            }`}
            title={isConnected ? 'Live updates connected' : 'ReconnectingÃ¢â‚¬Â¦'}
          >
            {isConnected
              ? <Wifi className="w-2.5 h-2.5" />
              : <WifiOff className="w-2.5 h-2.5 animate-pulse" />
            }
            {isConnected ? 'Live' : 'Offline'}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              aria-label="Mark all notifications as read"
              title="Mark all read"
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Tabs Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <div className="flex gap-0.5 p-1.5 mx-3 mt-2 bg-slate-900/60 rounded-xl flex-shrink-0" role="tablist">
        {(['all', 'unread'] as const).map(tab => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
              activeTab === tab
                ? 'bg-slate-700 text-white shadow'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab}
            {tab === 'unread' && unreadCount > 0 && (
              <span className="ml-1 text-[9px] text-rose-400">({unreadCount})</span>
            )}
          </button>
        ))}
      </div>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ List Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <div
        ref={scrollRef}
        role="list"
        aria-label="Notification list"
        className="flex-1 overflow-y-auto mt-1"
        style={{ scrollbarWidth: 'thin' }}
      >
        {isLoading && notifications.length === 0 ? (
          Array.from({ length: 4 }).map((_, i) => <NotificationSkeleton key={i} />)
        ) : displayList.length === 0 ? (
          <EmptyNotifications />
        ) : (
          <AnimatePresence initial={false}>
            {displayList.map(n => (
              <NotificationItem key={n.id} notification={n} onRead={onMarkRead} onDelete={onDelete} />
            ))}
          </AnimatePresence>
        )}

        {/* Load more */}
        {hasMore && !isLoading && displayList.length > 0 && (
          <button
            onClick={onLoadMore}
            className="w-full py-3 text-xs font-medium text-slate-500 hover:text-white flex items-center justify-center gap-1.5 transition-colors border-t border-slate-800/40"
          >
            <RefreshCw className="w-3 h-3" /> Load more
          </button>
        )}
        {isLoading && notifications.length > 0 && (
          <div className="py-4 flex justify-center">
            <RefreshCw className="w-4 h-4 text-slate-500 animate-spin" />
          </div>
        )}
      </div>
    </motion.div>
  )
})
NotificationPanel.displayName = 'NotificationPanel'
