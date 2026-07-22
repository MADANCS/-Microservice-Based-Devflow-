import React, { useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckSquare, MessageSquare, AlertCircle, Zap,
  Clock, Users, GitBranch, Check, ArrowRight, Trash2
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { NotificationPayload, NotificationType } from '../../types'
import { useReducedMotion } from '../../hooks/useReducedMotion'

// Ã¢â€â‚¬Ã¢â€â‚¬ Icon + colour per type Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const TYPE_META: Record<NotificationType, {
  icon: typeof CheckSquare
  color: string
  bg: string
  label: string
}> = {
  TASK_ASSIGNED:       { icon: CheckSquare,  color: 'text-blue-400',    bg: 'bg-blue-500/15',    label: 'Assigned' },
  COMMENT_ADDED:       { icon: MessageSquare, color: 'text-purple-400',  bg: 'bg-purple-500/15',  label: 'Comment' },
  DEADLINE_APPROACHING:{ icon: Clock,         color: 'text-amber-400',   bg: 'bg-amber-500/15',   label: 'Deadline' },
  SPRINT_STARTED:      { icon: Zap,           color: 'text-emerald-400', bg: 'bg-emerald-500/15', label: 'Sprint' },
  SPRINT_COMPLETED:    { icon: Zap,           color: 'text-emerald-400', bg: 'bg-emerald-500/15', label: 'Done' },
  MENTION:             { icon: Users,         color: 'text-cyan-400',    bg: 'bg-cyan-500/15',    label: 'Mention' },
  STATUS_CHANGED:      { icon: GitBranch,     color: 'text-indigo-400',  bg: 'bg-indigo-500/15',  label: 'Status' },
}

// Ã¢â€â‚¬Ã¢â€â‚¬ Relative time helper Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
function relativeTime(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60)   return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// Ã¢â€â‚¬Ã¢â€â‚¬ NotificationItem Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
export interface NotificationItemProps {
  notification: NotificationPayload
  onRead:       (id: string) => void
  onDelete:     (id: string) => void
}

export const NotificationItem = React.memo(({ notification, onRead, onDelete }: NotificationItemProps) => {
  const navigate  = useNavigate()
  const reduced   = useReducedMotion()
  const meta = TYPE_META[notification.type] ?? TYPE_META.STATUS_CHANGED
  const Icon = meta.icon

  const handleClick = useCallback(() => {
    onRead(notification.id)
    if (notification.resourcePath) navigate(notification.resourcePath)
  }, [notification.id, notification.resourcePath, onRead, navigate])

  return (
    <motion.div
      layout={!reduced}
      initial={!reduced ? { opacity: 0, x: -8 } : false}
      animate={{ opacity: 1, x: 0 }}
      exit={!reduced ? { opacity: 0, height: 0 } : undefined}
      transition={{ type: 'spring' as const, stiffness: 260, damping: 24 }}
      onClick={handleClick}
      role="listitem"
      aria-label={`${notification.title}: ${notification.message}`}
      className={`
        group flex items-start gap-3 px-4 py-3.5 cursor-pointer
        border-b border-slate-800/40 last:border-0
        transition-colors duration-150
        ${notification.read
          ? 'hover:bg-slate-800/20'
          : 'bg-slate-800/10 hover:bg-slate-800/25'
        }
      `}
    >
      {/* Type icon */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${meta.bg}`}>
        <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-xs font-semibold leading-snug line-clamp-1 ${notification.read ? 'text-slate-300' : 'text-white'}`}>
            {notification.title}
          </p>
          <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
            <span className="text-[10px] text-slate-500">
              {relativeTime(notification.timestamp)}
            </span>
            <button
              onClick={e => { e.stopPropagation(); onDelete(notification.id) }}
              aria-label="Delete notification"
              className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
          {notification.message}
        </p>
        {notification.resourcePath && (
          <button
            onClick={e => { e.stopPropagation(); navigate(notification.resourcePath!); onRead(notification.id) }}
            className={`flex items-center gap-1 mt-1.5 text-[10px] font-medium ${meta.color} hover:underline`}
            aria-label={`Navigate to resource: ${notification.resourcePath}`}
          >
            View <ArrowRight className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      {/* Unread dot */}
      <div className={`flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full transition-opacity ${notification.read ? 'opacity-0' : 'opacity-100 bg-[#61dafb]'}`} />
    </motion.div>
  )
})
NotificationItem.displayName = 'NotificationItem'
