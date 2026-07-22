import { configureStore } from '@reduxjs/toolkit'
import workspaceReducer from './workspaceSlice'
import notificationReducer from './notificationSlice'
import sprintReducer from './sprintSlice'
import themeReducer from './themeSlice'
import authReducer from './authSlice'
import teamReducer from './teamSlice'
import { apiSlice } from './apiSlice'

export const store = configureStore({
  reducer: {
    workspace:     workspaceReducer,
    notifications: notificationReducer,
    sprint:        sprintReducer,
    theme:         themeReducer,
    auth:          authReducer,
    team:          teamReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

