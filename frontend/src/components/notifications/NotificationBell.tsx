import React, { useCallback, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { useNotifications } from '../../hooks/useNotifications'
import { NotificationPanel } from './NotificationPanel'
import { useReducedMotion } from '../../hooks/useReducedMotion'

// Ã¢â€â‚¬Ã¢â€â‚¬ Unread badge Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const UnreadBadge = React.memo(({ count }: { count: number }) => {
  const reduced = useReducedMotion()
  if (count === 0) return null
  return (
    <motion.span
      key={count}
      initial={reduced ? false : { scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center
                 text-[9px] font-black bg-rose-500 text-white rounded-full px-1
                 border-2 border-[#020617] leading-none"
      aria-label={`${count} unread notifications`}
    >
      {count > 99 ? '99+' : count}
    </motion.span>
  )
})
UnreadBadge.displayName = 'UnreadBadge'

// Ã¢â€â‚¬Ã¢â€â‚¬ NotificationBell Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
export interface NotificationBellProps {
  /** Current user ID Ã¢â‚¬â€ passed to useNotifications for WS subscription */
  userId: string
}

export const NotificationBell = React.memo(({ userId }: NotificationBellProps) => {
  const [open, setOpen] = useState(false)
  const containerRef    = useRef<HTMLDivElement>(null)
  const reduced         = useReducedMotion()

  const {
    notifications, unreadCount, isConnected,
    isLoading, hasMore,
    loadMore, markRead, markAllRead, deleteNotification
  } = useNotifications(userId)

  const close   = useCallback(() => setOpen(false), [])
  const toggle  = useCallback(() => setOpen(v => !v), [])

  useOnClickOutside(containerRef, close)

  // Keyboard: Escape closes
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') close()
  }, [close])

  const hasNewPulse = unreadCount > 0 && !open

  return (
    <div
      ref={containerRef}
      className="relative"
      onKeyDown={handleKeyDown}
    >
      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Bell button Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <button
        onClick={toggle}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`
          relative p-2 rounded-xl transition-all
          ${open
            ? 'bg-slate-700/60 text-white'
            : 'text-slate-500 hover:text-white hover:bg-slate-800'
          }
        `}
      >
        {/* Outer pulse ring Ã¢â‚¬â€ only when unread AND closed */}
        {hasNewPulse && !reduced && (
          <span className="absolute inset-0 rounded-xl animate-ping bg-rose-500/15 pointer-events-none" />
        )}
        <Bell className="w-4 h-4 relative z-10" />
        <UnreadBadge count={unreadCount} />
      </button>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Panel Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <AnimatePresence>
        {open && (
          <NotificationPanel
            notifications={notifications}
            unreadCount={unreadCount}
            isConnected={isConnected}
            isLoading={isLoading}
            hasMore={hasMore}
            onLoadMore={loadMore}
            onMarkRead={markRead}
            onMarkAllRead={markAllRead}
            onDelete={deleteNotification}
            onClose={close}
          />
        )}
      </AnimatePresence>
    </div>
  )
})
NotificationBell.displayName = 'NotificationBell'
