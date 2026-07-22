import React, { useCallback, useMemo } from 'react'
import { Droppable, Draggable } from '@hello-pangea/dnd'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, AlertCircle } from 'lucide-react'
import { TaskCard } from './TaskCard'
import { TaskCardSkeleton } from '../Skeleton'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import type { KanbanColumn as KanbanColumnType, KanbanTask, TaskStatus } from '../../types'

// Ã¢â€â‚¬Ã¢â€â‚¬ Column colour map Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const COLUMN_STYLE: Record<string, { accent: string; glow: string; header: string }> = {
  TODO:        { accent: '#94a3b8', glow: 'rgba(148,163,184,0.08)', header: 'border-slate-600/40' },
  IN_PROGRESS: { accent: '#61dafb', glow: 'rgba(97,218,251,0.08)',  header: 'border-[#61dafb]/30' },
  IN_REVIEW:   { accent: '#f59e0b', glow: 'rgba(245,158,11,0.08)',  header: 'border-amber-400/30' },
  DONE:        { accent: '#10b981', glow: 'rgba(16,185,129,0.08)',  header: 'border-emerald-400/30' },
}

// Ã¢â€â‚¬Ã¢â€â‚¬ Empty state Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const EmptyColumn = React.memo(({ onAdd, accent }: { onAdd: () => void; accent: string }) => (
  <button
    onClick={onAdd}
    aria-label="Add task to this column"
    className="w-full flex flex-col items-center justify-center gap-2 py-10 rounded-2xl
               border-2 border-dashed border-slate-800 text-slate-600
               hover:border-slate-600 hover:text-slate-400 transition-all group"
  >
    <Plus className="w-6 h-6 transition-transform group-hover:scale-125" style={{ color: accent }} />
    <span className="text-xs font-medium">Add first task</span>
  </button>
))
EmptyColumn.displayName = 'EmptyColumn'

// Ã¢â€â‚¬Ã¢â€â‚¬ WIP limit badge Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const WIPBadge = React.memo(({ count, limit }: { count: number; limit: number }) => {
  const exceeded = count > limit
  return (
    <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
      exceeded
        ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
        : 'bg-slate-800 text-slate-400 border-slate-700'
    }`}>
      {exceeded && <AlertCircle className="w-2.5 h-2.5" />}
      {count}/{limit}
    </div>
  )
})
WIPBadge.displayName = 'WIPBadge'

// Ã¢â€â‚¬Ã¢â€â‚¬ KanbanColumn Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
export interface KanbanColumnProps {
  column: KanbanColumnType
  isMobile: boolean
  isLoading?: boolean
  onAddTask: (columnId: TaskStatus) => void
  onTaskClick: (task: KanbanTask) => void
  onMoveTask: (taskId: string, fromCol: TaskStatus, toCol: TaskStatus) => void
  columnOrder: TaskStatus[]
}

export const KanbanColumn = React.memo(({
  column, isMobile, isLoading = false,
  onAddTask, onTaskClick, onMoveTask, columnOrder,
}: KanbanColumnProps) => {
  const reduced = useReducedMotion()
  const style   = COLUMN_STYLE[column.id] ?? COLUMN_STYLE.TODO
  const currentIdx = columnOrder.indexOf(column.id)

  const wipExceeded = useMemo(
    () => column.wipLimit !== null && column.tasks.length > column.wipLimit,
    [column.wipLimit, column.tasks.length]
  )

  const handleMoveLeft = useCallback((taskId: string) => {
    const prev = columnOrder[currentIdx - 1]
    if (prev) onMoveTask(taskId, column.id, prev)
  }, [column.id, columnOrder, currentIdx, onMoveTask])

  const handleMoveRight = useCallback((taskId: string) => {
    const next = columnOrder[currentIdx + 1]
    if (next) onMoveTask(taskId, column.id, next)
  }, [column.id, columnOrder, currentIdx, onMoveTask])

  return (
    <motion.div
      layout={!reduced}
      className="flex flex-col min-w-[280px] sm:min-w-[300px] max-w-xs flex-shrink-0"
      role="region"
      aria-label={`${column.title} column, ${column.tasks.length} tasks`}
    >
      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Column Header Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <div
        className={`flex items-center justify-between px-3 py-2.5 mb-3 rounded-xl border ${style.header}`}
        style={{ background: style.glow }}
      >
        <div className="flex items-center gap-2">
          {/* Accent dot */}
          <div className="w-2 h-2 rounded-full" style={{ background: style.accent }} />
          <h3 className="text-sm font-semibold text-white">{column.title}</h3>
        </div>
        <div className="flex items-center gap-1.5">
          {column.wipLimit !== null && (
            <WIPBadge count={column.tasks.length} limit={column.wipLimit} />
          )}
          <span className="text-[11px] font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded-full border border-slate-700">
            {column.tasks.length}
          </span>
        </div>
      </div>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ WIP exceeded warning Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <AnimatePresence>
        {wipExceeded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2 flex items-center gap-1.5 text-[10px] text-rose-400 font-medium
                       bg-rose-500/8 border border-rose-500/20 rounded-xl px-3 py-2"
          >
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            WIP limit exceeded Ã¢â‚¬â€ focus on completing existing tasks
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Loading skeletons Ã¢â€â‚¬Ã¢â€â‚¬ */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => <TaskCardSkeleton key={i} />)}
        </div>
      ) : (
        /* Ã¢â€â‚¬Ã¢â€â‚¬ Droppable area (desktop) / static list (mobile) Ã¢â€â‚¬Ã¢â€â‚¬ */
        isMobile ? (
          <div className="space-y-3 overflow-y-auto max-h-[60vh]">
            {column.tasks.length === 0 ? (
              <EmptyColumn onAdd={() => onAddTask(column.id)} accent={style.accent} />
            ) : (
              column.tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isMobile
                  canMoveLeft={currentIdx > 0}
                  canMoveRight={currentIdx < columnOrder.length - 1}
                  onMoveLeft={() => handleMoveLeft(task.id)}
                  onMoveRight={() => handleMoveRight(task.id)}
                  onClick={onTaskClick}
                />
              ))
            )}
          </div>
        ) : (
          <Droppable droppableId={column.id}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex-1 space-y-3 p-2 rounded-2xl min-h-[200px] transition-colors duration-200 overflow-y-auto max-h-[calc(100vh-260px)] ${
                  snapshot.isDraggingOver
                    ? 'border-2 border-dashed'
                    : 'border-2 border-transparent'
                }`}
                style={{
                  borderColor: snapshot.isDraggingOver ? style.accent : undefined,
                  background: snapshot.isDraggingOver ? style.glow : undefined,
                }}
              >
                {column.tasks.length === 0 && !snapshot.isDraggingOver ? (
                  <EmptyColumn onAdd={() => onAddTask(column.id)} accent={style.accent} />
                ) : (
                  column.tasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(dragProvided, dragSnapshot) => (
                        <TaskCard
                          task={task}
                          isDragging={dragSnapshot.isDragging}
                          innerRef={dragProvided.innerRef}
                          draggableProps={dragProvided.draggableProps}
                          dragHandleProps={dragProvided.dragHandleProps ?? undefined}
                          onClick={onTaskClick}
                        />
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        )
      )}

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Add task button Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <button
        onClick={() => onAddTask(column.id)}
        aria-label={`Add task to ${column.title}`}
        className="mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl
                   border border-dashed border-slate-800 text-slate-500 text-xs font-medium
                   hover:border-slate-600 hover:text-white hover:bg-slate-800/40 transition-all"
      >
        <Plus className="w-3.5 h-3.5" /> Add Task
      </button>
    </motion.div>
  )
})
KanbanColumn.displayName = 'KanbanColumn'
