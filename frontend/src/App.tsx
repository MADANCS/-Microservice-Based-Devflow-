import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { ToastContainer } from './components/ToastContainer'
import { TaskDetailPanel } from './components/TaskDetailPanel'
import { KanbanBoard } from './components/kanban/KanbanBoard'
import { KanbanColumnSkeleton } from './components/Skeleton'
import { StatCardSkeleton, ChartSkeleton } from './components/Skeleton'


// Ã¢â€â‚¬Ã¢â€â‚¬ Lazy-loaded heavy pages Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
// Each route chunk is split at the page level Ã¢â‚¬â€ reduces initial bundle by ~60%
const CommandCenter  = lazy(() => import('./pages/CommandCenter').then(m => ({ default: m.CommandCenter })))
const Dashboard      = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })))
const Projects       = lazy(() => import('./pages/Projects').then(m => ({ default: m.Projects })))
const CalendarPage   = lazy(() => import('./pages/CalendarPage').then(m => ({ default: m.CalendarPage })))
const Analytics      = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })))
const AIInsights     = lazy(() => import('./pages/AIInsights').then(m => ({ default: m.AIInsights })))
const Settings       = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })))
const Team           = lazy(() => import('./pages/Team').then(m => ({ default: m.Team })))
const Roadmap        = lazy(() => import('./pages/Roadmap').then(m => ({ default: m.Roadmap })))
const SprintPlanning = lazy(() => import('./pages/SprintPlanning').then(m => ({ default: m.SprintPlanning })))

// Ã¢â€â‚¬Ã¢â€â‚¬ Fallback skeletons per page Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const DashboardFallback = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2"><ChartSkeleton height={200} /></div>
      <ChartSkeleton height={200} />
    </div>
  </div>
)

const BoardFallback = () => (
  <div className="flex gap-5 overflow-x-auto">
    {Array.from({ length: 4 }).map((_, i) => <KanbanColumnSkeleton key={i} />)}
  </div>
)

const PageFallback = () => (
  <div className="space-y-4">
    <div className="h-8 w-64 bg-slate-800 rounded-xl animate-pulse" />
    <div className="h-4 w-48 bg-slate-800/60 rounded-lg animate-pulse" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-40 bg-slate-800/40 rounded-2xl animate-pulse border border-slate-800" />
      ))}
    </div>
  </div>
)

// Ã¢â€â‚¬Ã¢â€â‚¬ App Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
import { AuthPage } from './pages/AuthPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={
                <Suspense fallback={<PageFallback />}>
                  <CommandCenter />
                </Suspense>
              } />
              <Route path="dashboard" element={
                <Suspense fallback={<DashboardFallback />}>
                  <Dashboard />
                </Suspense>
              } />
              <Route path="projects" element={
                <Suspense fallback={<PageFallback />}>
                  <Projects />
                </Suspense>
              } />
              <Route path="tasks" element={<KanbanBoard />} />
              <Route path="calendar" element={
                <Suspense fallback={<PageFallback />}>
                  <CalendarPage />
                </Suspense>
              } />
              <Route path="analytics" element={
                <Suspense fallback={<DashboardFallback />}>
                  <Analytics />
                </Suspense>
              } />
              <Route path="ai-insights" element={
                <Suspense fallback={<DashboardFallback />}>
                  <AIInsights />
                </Suspense>
              } />
              <Route path="sprints" element={
                <Suspense fallback={<PageFallback />}>
                  <SprintPlanning />
                </Suspense>
              } />
              <Route path="roadmap" element={
                <Suspense fallback={<PageFallback />}>
                  <Roadmap />
                </Suspense>
              } />
              <Route path="team" element={
                <Suspense fallback={<PageFallback />}>
                  <Team />
                </Suspense>
              } />
              <Route path="settings" element={<Navigate to="/dashboard" replace />} />
          </Route>

        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global overlays outside route tree Ã¢â‚¬â€ persist across navigation */}
      <TaskDetailPanel />
      <ToastContainer />
    </BrowserRouter>
  )
}

export default App
