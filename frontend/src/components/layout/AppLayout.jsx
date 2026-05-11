import React, { useEffect } from 'react'
import { useTheme } from '../../App';
import { useSelector, useDispatch } from 'react-redux'
import { Navigate, useParams } from 'react-router-dom'
import { setWorkspaceList, setCurrentWorkspace } from '../../store/workspaceSlice'
import { addNotification } from '../../store/uiSlice'
import api from '../../services/api'
import { connectSocket, getSocket, joinWorkspace } from '../../services/socket'
import Sidebar from './Sidebar'
import TopNav from './TopNav'
import ToastContainer from '../ui/Toast'

export default function AppLayout({ children, title }) {
  const token = useSelector(s => s.auth.accessToken)
  const workspaceList = useSelector(s => s.workspace.list)
  const current = useSelector(s => s.workspace.current)
  const dispatch = useDispatch()
  const { workspaceId } = useParams()

  if (!token) return <Navigate to="/login" replace />

  // Load workspace list
  useEffect(() => {
    api.get('/workspaces').then(r => {
      const list = r.data || []
      dispatch(setWorkspaceList(list))
      // Set current workspace from URL param or first in list
      if (workspaceId) {
        const found = list.find(w => String(w.workspace?._id) === String(workspaceId))
        if (found) dispatch(setCurrentWorkspace(found))
      } else if (list.length && !current) {
        dispatch(setCurrentWorkspace(list[0]))
      }
    }).catch(() => {})
  }, [workspaceId])

  // Socket setup
  useEffect(() => {
    if (!token) return
    const s = connectSocket(token)
    if (s) {
      s.on('notification.created', (n) => {
        dispatch(addNotification(n))
      })
    }
    return () => {
      const s = getSocket()
      if (s) {
        s.off('notification.created')
      }
    }
  }, [token, dispatch])

  // Join workspace room
  useEffect(() => {
    if (workspaceId) {
      joinWorkspace(workspaceId)
    }
  }, [workspaceId])

  const { theme } = useTheme ? useTheme() : { theme: 'dark' };
  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <Sidebar />
      <TopNav title={title || current?.name || 'Dashboard'} workspaceId={workspaceId || current?._id} />
      <main
        style={{
          marginLeft: '260px',
          paddingTop: '60px',
          minHeight: '100vh'
        }}
      >
        <div className="p-6 animate-fade-in">
          {children}
        </div>
      </main>
      <ToastContainer />
    </div>
  )
}
