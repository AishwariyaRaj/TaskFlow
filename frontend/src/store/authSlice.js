import { createSlice } from '@reduxjs/toolkit'

const stored = (() => {
  try { return JSON.parse(localStorage.getItem('auth') || 'null') } catch { return null }
})()

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    accessToken: stored?.accessToken || null,
    user: stored?.user || null,
  },
  reducers: {
    setAuth(state, action) {
      state.accessToken = action.payload.accessToken
      state.user = action.payload.user
      try { localStorage.setItem('auth', JSON.stringify(action.payload)) } catch {}
    },
    setAccessToken(state, action) {
      state.accessToken = action.payload
      try {
        const stored = JSON.parse(localStorage.getItem('auth') || '{}')
        stored.accessToken = action.payload
        localStorage.setItem('auth', JSON.stringify(stored))
      } catch {}
    },
    clearAuth(state) {
      state.accessToken = null
      state.user = null
      try { localStorage.removeItem('auth') } catch {}
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload }
      try {
        const stored = JSON.parse(localStorage.getItem('auth') || '{}')
        stored.user = state.user
        localStorage.setItem('auth', JSON.stringify(stored))
      } catch {}
    }
  }
})

export const { setAuth, setAccessToken, clearAuth, updateUser } = authSlice.actions
export default authSlice.reducer
