import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import workspaceReducer from './workspaceSlice'
import uiReducer from './uiSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    workspace: workspaceReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false })
})

export default store
