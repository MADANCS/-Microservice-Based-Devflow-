import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  MessageSquare, Calendar, Flag, GripVertical, AlertTriangle,
  Clock, CheckCircle2, ChevronUp, ChevronDown
} from 'lucide-react'
import type { KanbanTask } from '../../types'
import { Priority } from '../../types'
import { useReducedMotion } from '../../hooks/useReducedMotion'

// Ã¢â€â‚¬Ã¢â€â‚¬ Priority metadata Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const PRIORITY_META: Record<Priority, { label: string; color: string; bg: string; icon: typeof Flag }> = {
  [Priority.CRITICAL]: { label: 'Critical', color: 'text-rose-400',   bg: 'bg-rose-500/15 border-rose-500/25',   icon: AlertTriangle },
  [Priority.HIGH]:     { label: 'High',     color: 'text-amber-400',  bg: 'bg-amber-500/15 border-amber-500/25', icon: ChevronUp },
  [Priority.MEDIUM]:   { label: 'Medium',   color: 'text-blue-400',   bg: 'bg-blue-500/15 border-blue-500/25',   icon: Flag },
  [Priority.LOW]:      { label: 'Low',      color: 'text-slate-400',  bg: 'bg-slate-700/40 border-slate-600/25', icon: ChevronDown },
}

// Ã¢â€â‚¬Ã¢â€â‚¬ Mobile move buttons Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
interface MobileMoveProps {
  canMoveLeft: boolean
  canMoveRight: boolean
  onMoveLeft: () => void
  onMoveRight: () => void
}
const MobileMoveButtons = React.memo(({ canMoveLeft, canMoveRight, onMoveLeft, onMoveRight }: MobileMoveProps) => (
  <div className="flex gap-1 mt-2 sm:hidden">
    {canMoveLeft && (
      <button
        aria-label="Move task left"
        onClick={e => { e.stopPropagation(); onMoveLeft() }}
        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium
                   bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
      >
        Ã¢â€ Â Back
      </button>
    )}
    {canMoveRight && (
      <button
        aria-label="Move task right"
        onClick={e => { e.stopPropagation(); onMoveRight() }}
        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium
                   bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
      >
        Next Ã¢â€ â€™
      </button>
    )}
  </div>
))
MobileMoveButtons.displayName = 'MobileMoveButtons'

// Ã¢â€â‚¬Ã¢â€â‚¬ Task Card Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
export interface TaskCardProps {
  task: KanbanTask
  isDragging?: boolean
  isMobile?: boolean
  canMoveLeft?: boolean
  canMoveRight?: boolean
  onMoveLeft?: () => void
  onMoveRight?: () => void
  onClick?: (task: KanbanTask) => void
  /** Forwarded ref from react-dnd provided.innerRef */
  innerRef?: React.Ref<HTMLDivElement>
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
  draggableProps?: React.HTMLAttributes<HTMLDivElement>
}

export const TaskCard = React.memo(({
  task, isDragging = false, isMobile = false,
  canMoveLeft = false, canMoveRight = false,
  onMoveLeft, onMoveRight, onClick,
  innerRef, dragHandleProps, draggableProps,
}: TaskCardProps) => {
  const reduced = useReducedMotion()

  const meta = PRIORITY_META[task.priority] ?? PRIORITY_META[Priority.LOW]
  const PrioIcon = meta.icon

  const isOverdue = useMemo(() => {
    if (!task.dueDate) return false
    return new Date(task.dueDate) < new Date() && task.status !== 'DONE'
  }, [task.dueDate, task.status])

  const formattedDate = useMemo(() => {
    if (!task.dueDate) return null
    const d = new Date(task.dueDate)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }, [task.dueDate])

  return (
    <div ref={innerRef} {...draggableProps}>
      <motion.div
        layout={!reduced}
        animate={isDragging && !reduced
          ? { scale: 1.03, rotate: 1, boxShadow: '0 30px 60px -10px rgba(0,0,0,0.6), 0 0 0 2px rgba(97,218,251,0.3)' }
          : { scale: 1, rotate: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }
        }
        transition={reduced ? { duration: 0 } : { type: 'spring' as const, stiffness: 400, damping: 30 }}
        onClick={() => onClick?.(task)}
        role="article"
        aria-label={`Task ${task.key}: ${task.title}, Priority ${meta.label}`}
        className={`
          group p-4 rounded-2xl cursor-pointer select-none
          border transition-all duration-200
          ${isDragging
            ? 'bg-slate-800/95 border-[#61dafb]/40'
            : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
          }
        `}
      >
        {/* Top row: key + priority */}
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
            {task.key}
          </span>
          <span className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${meta.bg} ${meta.color}`}>
            <PrioIcon className="w-2.5 h-2.5" />
            {meta.label}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-sm font-semibold text-white leading-snug mb-2 line-clamp-2 group-hover:text-[#61dafb]/90 transition-colors">
          {task.title}
        </h4>

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2.5">
            {task.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[9px] bg-slate-800 border border-slate-700 text-slate-400 px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer: assignee + due date + comments + story points */}
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/60">
          <div className="flex items-center gap-2">
            {/* Assignee */}
            {task.assigneeAvatar ? (
              <img
                src={task.assigneeAvatar}
                alt={task.assigneeName ?? 'Assignee'}
                title={task.assigneeName ?? undefined}
                className="w-6 h-6 rounded-full border border-slate-700 flex-shrink-0"
              />
            ) : task.assigneeName ? (
              <div
                className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[9px] font-bold text-indigo-300 flex-shrink-0"
                title={task.assigneeName}
              >
                {task.assigneeName.charAt(0).toUpperCase()}
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex-shrink-0" title="Unassigned" />
            )}

            {/* Comments */}
            {task.commentCount > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] text-slate-500">
                <MessageSquare className="w-3 h-3" />
                {task.commentCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Story points */}
            <div className="w-5 h-5 rounded bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-[9px] font-bold text-indigo-400">
              {task.points}
            </div>

            {/* Due date */}
            {formattedDate && (
              <span className={`flex items-center gap-0.5 text-[10px] font-medium ${
                isOverdue
                  ? 'text-rose-400'
                  : 'text-slate-500'
              }`}>
                {isOverdue ? <AlertTriangle className="w-2.5 h-2.5" /> : <Calendar className="w-2.5 h-2.5" />}
                {formattedDate}
              </span>
            )}

            {/* Drag handle (desktop only) */}
            {!isMobile && (
              <div
                {...dragHandleProps}
                aria-label="Drag to reorder"
                className="opacity-0 group-hover:opacity-50 hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity p-0.5"
                onClick={e => e.stopPropagation()}
              >
                <GripVertical className="w-3.5 h-3.5 text-slate-400" />
              </div>
            )}
          </div>
        </div>

        {/* Mobile move buttons */}
        {isMobile && (
          <MobileMoveButtons
            canMoveLeft={canMoveLeft}
            canMoveRight={canMoveRight}
            onMoveLeft={onMoveLeft ?? (() => {})}
            onMoveRight={onMoveRight ?? (() => {})}
          />
        )}
      </motion.div>
    </div>
  )
})
TaskCard.displayName = 'TaskCard'
