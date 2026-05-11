import { createSlice } from '@reduxjs/toolkit'

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState: {
    current: null,       // { _id, name, slug, billing, owner }
    currentRole: null,   // 'Owner' | 'Admin' | 'Member'
    list: [],            // [{ workspace, role }]
  },
  reducers: {
    setWorkspaceList(state, action) {
      state.list = action.payload
    },
    setCurrentWorkspace(state, action) {
      state.current = action.payload.workspace
      state.currentRole = action.payload.role
    },
    clearWorkspace(state) {
      state.current = null
      state.currentRole = null
      state.list = []
    },
    addWorkspace(state, action) {
      state.list.unshift({ workspace: action.payload, role: 'Owner' })
    },
    updateWorkspace(state, action) {
      const idx = state.list.findIndex(w => w.workspace?._id === action.payload._id)
      if (idx !== -1) state.list[idx].workspace = { ...state.list[idx].workspace, ...action.payload }
      if (state.current?._id === action.payload._id) {
        state.current = { ...state.current, ...action.payload }
      }
    }
  }
})

export const { setWorkspaceList, setCurrentWorkspace, clearWorkspace, addWorkspace, updateWorkspace } = workspaceSlice.actions
export default workspaceSlice.reducer
