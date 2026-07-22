import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from './store'

// Ã¢â€â‚¬Ã¢â€â‚¬ Workspace selectors Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

export const selectTasks    = (s: RootState) => s.workspace.tasks
export const selectProjects = (s: RootState) => s.workspace.projects

/** All tasks for a given project Ã¢â‚¬â€ memoized by projectId */
export const makeSelectTasksByProject = () =>
  createSelector(
    selectTasks,
    (_: RootState, projectId: string) => projectId,
    (tasks, projectId) => tasks.filter(t => t.projectId === projectId)
  )

/** KPI summary Ã¢â‚¬â€ derived in one pass, not recalculated on every render */
export const selectWorkspaceKPIs = createSelector(
  selectTasks,
  selectProjects,
  (tasks, projects) => {
    const today          = new Date().toISOString().split('T')[0]
    const totalTasks     = tasks.length
    const completedTasks = tasks.filter(t => t.status === 'DONE').length
    const inProgress     = tasks.filter(t => t.status === 'IN_PROGRESS').length
    const criticalTasks  = tasks.filter(t => t.priority === 'CRITICAL' && t.status !== 'DONE').length
    const overdueTasks   = tasks.filter(t => t.dueDate < today && t.status !== 'DONE')
    const dueTodayTasks  = tasks.filter(t => t.dueDate === today && t.status !== 'DONE')
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    const activeProjects = projects.filter(p => p.status === 'ACTIVE').length

    return {
      totalTasks,
      completedTasks,
      inProgress,
      criticalTasks,
      overdueTasks,
      dueTodayCount: dueTodayTasks.length,
      completionRate,
      activeProjects,
    }
  }
)

/** Project progress rows Ã¢â‚¬â€ memoized */
export const selectProjectProgress = createSelector(
  selectProjects,
  selectTasks,
  (projects, tasks) =>
    projects.map(proj => {
      const pt    = tasks.filter(t => t.projectId === proj.id)
      const done  = pt.filter(t => t.status === 'DONE').length
      const pct   = pt.length > 0 ? Math.round((done / pt.length) * 100) : 0
      return { ...proj, taskCount: pt.length, doneCount: done, pct }
    })
)

/** Sprint-ready tasks grouped by status Ã¢â‚¬â€ memoized */
export const selectTasksByStatus = createSelector(
  selectTasks,
  tasks => ({
    TODO:        tasks.filter(t => t.status === 'TODO'),
    IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS'),
    IN_REVIEW:   tasks.filter(t => t.status === 'IN_REVIEW'),
    DONE:        tasks.filter(t => t.status === 'DONE'),
  })
)

// Ã¢â€â‚¬Ã¢â€â‚¬ Notification selectors Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

export const selectNotifications = (s: RootState) => s.notifications.notifications
export const selectToasts        = (s: RootState) => s.notifications.toasts

export const selectUnreadCount = createSelector(
  selectNotifications,
  notifs => notifs.filter(n => !n.read).length
)

export const selectUnreadNotifications = createSelector(
  selectNotifications,
  notifs => notifs.filter(n => !n.read)
)

// Ã¢â€â‚¬Ã¢â€â‚¬ Sprint selectors Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

export const selectSprints       = (s: RootState) => s.sprint.sprints
export const selectTeamMembers   = (s: RootState) => s.sprint.teamMembers
export const selectActivePanelId = (s: RootState) => s.sprint.activePanelTaskId

export const selectActiveSprint = createSelector(
  selectSprints,
  sprints => sprints.find(s => s.status === 'ACTIVE') ?? null
)

/** Velocity data Ã¢â‚¬â€ last N sprints for chart rendering */
export const selectVelocityData = createSelector(
  selectSprints,
  sprints =>
    sprints.slice(-7).map(s => ({
      name:     `S${s.sprintNumber}`,
      planned:  s.plannedPoints,
      delivered:s.completedPoints,
      bugs:     Math.floor(Math.random() * 5),       // replace with real bug count
    }))
)
