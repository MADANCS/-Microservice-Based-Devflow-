import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react'
import type { RootState } from '../store/store'
import { dismissToast } from '../store/notificationSlice'

const ICONS = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
  error: <XCircle className="w-5 h-5 text-rose-400" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
  info: <Info className="w-5 h-5 text-blue-400" />,
}

const BORDER = {
  success: 'border-emerald-500/30',
  error: 'border-rose-500/30',
  warning: 'border-amber-500/30',
  info: 'border-blue-500/30',
}

const BAR = {
  success: 'bg-emerald-500',
  error: 'bg-rose-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
}

const AUTO_DISMISS_MS = 4500

export const ToastContainer = () => {
  const dispatch = useDispatch<any>()
  const toasts = useSelector((s: RootState) => s.notifications.toasts)

  useEffect(() => {
    if (toasts.length === 0) return
    const latest = toasts[toasts.length - 1]
    const timer = setTimeout(() => dispatch(dismissToast(latest.id)), AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [toasts, dispatch])

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, x: 80, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
            className={`pointer-events-auto relative w-80 bg-dark-900/95 backdrop-blur-xl border ${BORDER[toast.type]} rounded-2xl shadow-2xl shadow-black/40 overflow-hidden`}
          >
            {/* Progress bar */}
            <motion.div
              className={`absolute top-0 left-0 h-0.5 ${BAR[toast.type]}`}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: AUTO_DISMISS_MS / 1000, ease: 'linear' }}
            />
            <div className="p-4 flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">{ICONS[toast.type]}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{toast.title}</p>
                <p className="text-xs text-dark-300 mt-0.5 leading-relaxed">{toast.message}</p>
              </div>
              <button
                onClick={() => dispatch(dismissToast(toast.id))}
                className="text-dark-400 hover:text-white transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
