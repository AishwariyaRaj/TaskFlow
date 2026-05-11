import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    toasts: [],
    sidebarOpen: true,
    notifications: [],
    unreadCount: 0,
  },
  reducers: {
    addToast(state, action) {
      const toast = { id: Date.now() + Math.random(), ...action.payload }
      state.toasts.push(toast)
    },
    removeToast(state, action) {
      state.toasts = state.toasts.filter(t => t.id !== action.payload)
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen(state, action) {
      state.sidebarOpen = action.payload
    },
    setNotifications(state, action) {
      state.notifications = action.payload
      state.unreadCount = action.payload.filter(n => !n.read).length
    },
    addNotification(state, action) {
      state.notifications.unshift(action.payload)
      state.unreadCount += 1
    },
    markAllNotificationsRead(state) {
      state.notifications = state.notifications.map(n => ({ ...n, read: true }))
      state.unreadCount = 0
    }
  }
})

export const { addToast, removeToast, toggleSidebar, setSidebarOpen, setNotifications, addNotification, markAllNotificationsRead } = uiSlice.actions
export default uiSlice.reducer
