import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useTheme } from '../../App';
import { addNotification, markAllNotificationsRead, setNotifications } from '../../store/uiSlice'
import { addToast } from '../../store/uiSlice'
import api from '../../services/api'

function NotificationPanel({ workspaceId, onClose }) {
  const notifications = useSelector(s => s.ui.notifications)
  const dispatch = useDispatch()

  async function handleMarkAll() {
    try {
      if (workspaceId) {
        await api.patch(`/workspaces/${workspaceId}/notifications/mark-all-read`)
      }
      dispatch(markAllNotificationsRead())
    } catch {}
  }

  return (
    <div className="absolute right-0 top-full mt-2 w-80 dropdown">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2e2e3e]">
        <span className="font-semibold text-sm text-[#f1f1f8]">Notifications</span>
        {notifications.some(n => !n.read) && (
          <button onClick={handleMarkAll} className="text-xs text-indigo-400 hover:text-indigo-300">
            Mark all read
          </button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-[#8b8ba8]">No notifications</div>
        ) : (
          notifications.slice(0, 10).map(n => (
            <div
              key={n._id || n.id}
              className={`px-4 py-3 border-b border-[#2e2e3e] last:border-0 hover:bg-white/5 transition-colors ${!n.read ? 'bg-indigo-600/5' : ''}`}
            >
              <div className="flex items-start gap-2">
                {!n.read && <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />}
                <div className={!n.read ? '' : 'pl-4'}>
                  <div className="text-sm font-medium text-[#f1f1f8] line-clamp-1">{n.title}</div>
                  <div className="text-xs text-[#8b8ba8] mt-0.5 line-clamp-1">{n.message}</div>
                  <div className="text-[10px] text-[#8b8ba8] mt-1">{new Date(n.createdAt || Date.now()).toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default function TopNav({ title, workspaceId }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const unreadCount = useSelector(s => s.ui.unreadCount)
  const { theme, toggleTheme } = useTheme();
  const [showNotif, setShowNotif] = useState(false)
  const notifRef = useRef()

  useEffect(() => {
    if (!workspaceId) return
    api.get(`/workspaces/${workspaceId}/notifications`)
      .then(r => dispatch(setNotifications(r.data || [])))
      .catch(() => {})
  }, [workspaceId, dispatch])

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header
      className="fixed top-0 right-0 z-20 flex items-center justify-between px-6 py-0 border-b border-[#2e2e3e]/60"
      style={{
        left: '260px',
        height: '60px',
        background: 'rgba(15, 15, 19, 0.9)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-center gap-3">
        <h1 className="text-base font-semibold text-[#f1f1f8]">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative w-9 h-9 rounded-xl bg-white/5 hover:bg-white/8 flex items-center justify-center text-[#8b8ba8] hover:text-[#f1f1f8] transition-all border border-transparent hover:border-[#2e2e3e]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-[10px] text-white font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {showNotif && (
            <NotificationPanel workspaceId={workspaceId} onClose={() => setShowNotif(false)} />
          )}
        </div>
      </div>
    </header>
  )
}
