import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type ThemeMode = 'dark' | 'light' | 'system'
export type AccentColor = 'blue' | 'indigo' | 'violet' | 'emerald' | 'rose'

interface ThemeState {
  mode: ThemeMode
  accent: AccentColor
  sidebarCollapsed: boolean
  compactMode: boolean
}

const saved = (() => {
  try { return JSON.parse(localStorage.getItem('df_theme') || '{}') } catch { return {} }
})()

const initialState: ThemeState = {
  mode: saved.mode ?? 'dark',
  accent: saved.accent ?? 'blue',
  sidebarCollapsed: saved.sidebarCollapsed ?? false,
  compactMode: saved.compactMode ?? false,
}

const persist = (state: ThemeState) =>
  localStorage.setItem('df_theme', JSON.stringify(state))

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setMode: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload
      persist(state)
    },
    setAccent: (state, action: PayloadAction<AccentColor>) => {
      state.accent = action.payload
      persist(state)
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
      persist(state)
    },
    toggleCompactMode: (state) => {
      state.compactMode = !state.compactMode
      persist(state)
    },
  },
})

export const { setMode, setAccent, toggleSidebar, toggleCompactMode } = themeSlice.actions
export default themeSlice.reducer
