import React, { useState } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { clearAuth } from '../../store/authSlice'
import { clearWorkspace, setCurrentWorkspace } from '../../store/workspaceSlice'
import { disconnectSocket } from '../../services/socket'
import api from '../../services/api'
import Avatar from '../ui/Avatar'
import { addToast } from '../../store/uiSlice'

const navItems = [
  {
    to: (wid) => `/workspaces/${wid}`,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    label: 'Dashboard',
    end: true
  },
  {
    to: (wid) => `/workspaces/${wid}/projects`,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    label: 'Projects'
  },
  {
    to: (wid) => `/workspaces/${wid}/members`,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    label: 'Members'
  },
  {
    to: (wid) => `/workspaces/${wid}/analytics`,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    label: 'Analytics'
  },
  {
    to: (wid) => `/workspaces/${wid}/billing`,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    label: 'Billing'
  },
  {
    to: (wid) => `/workspaces/${wid}/automations`,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    label: 'Automations'
  },
  {
    to: (wid) => `/workspaces/${wid}/calendar`,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    label: 'Calendar'
  },
  {
    to: (wid) => `/workspaces/${wid}/settings`,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    label: 'Settings'
  },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { workspaceId } = useParams()
  const workspaceList = useSelector(s => s.workspace.list)
  const current = useSelector(s => s.workspace.current)
  const user = useSelector(s => s.auth.user)
  const [switching, setSwitching] = useState(false)
  const plan = current?.plan || 'FREE'
  const planLabel = plan === 'FREE' ? 'Free' : plan
  const isFree = plan === 'FREE'

  async function handleLogout() {
    try {
      await api.post('/auth/logout')
    } catch {}
    disconnectSocket()
    dispatch(clearAuth())
    dispatch(clearWorkspace())
    navigate('/login')
    dispatch(addToast({ type: 'success', title: 'Logged out', message: 'See you next time!' }))
  }

  function handleSwitchWorkspace(ws) {
    dispatch(setCurrentWorkspace(ws))
    navigate(`/workspaces/${ws.workspace._id}`)
    setSwitching(false)
  }

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-[260px] flex flex-col z-30"
      style={{ background: 'linear-gradient(180deg, #12121a 0%, #0f0f13 100%)', borderRight: '1px solid rgba(46,46,62,0.6)' }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#2e2e3e]/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-glow-sm">
            T
          </div>
          <span className="font-bold text-[#f1f1f8] text-lg" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            TaskFlow
          </span>
        </div>
      </div>

      {/* Workspace Switcher */}
      <div className="px-3 py-3 border-b border-[#2e2e3e]/60">
        <div className="relative">
          <button
            onClick={() => setSwitching(!switching)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/8 border border-[#2e2e3e] transition-all duration-200 group"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {current?.name?.[0]?.toUpperCase() || 'W'}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="text-sm font-medium text-[#f1f1f8] truncate">{current?.name || 'Select Workspace'}</div>
              <div className="text-xs text-[#8b8ba8]">{planLabel} Plan</div>
            </div>
            <svg className={`w-4 h-4 text-[#8b8ba8] transition-transform ${switching ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {switching && (
            <div className="absolute top-full left-0 right-0 mt-2 dropdown z-50">
              <div className="p-1">
                {workspaceList.map(ws => (
                  <button
                    key={ws.workspace?._id}
                    onClick={() => handleSwitchWorkspace(ws)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                      ws.workspace?._id === current?._id
                        ? 'bg-indigo-600/15 text-indigo-400'
                        : 'text-[#8b8ba8] hover:bg-white/5 hover:text-[#f1f1f8]'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                      {ws.workspace?.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="truncate">{ws.workspace?.name}</span>
                    <span className="ml-auto text-[10px] opacity-60">{ws.role}</span>
                  </button>
                ))}
                <div className="dropdown-divider" />
                <button
                  onClick={() => { setSwitching(false); navigate('/workspaces/new') }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-indigo-400 hover:bg-indigo-600/10 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Workspace
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-hidden">
        <div className="space-y-0.5">
          {navItems.map(item => {
            if (item.label === 'Analytics' && isFree) {
              return (
                <div key={item.label} className="sidebar-link opacity-50 cursor-not-allowed">
                  {item.icon}
                  <span>{item.label}</span>
                  <span className="ml-auto text-[10px] text-indigo-400">PRO</span>
                </div>
              )
            }
            if ((item.label === 'Automations' || item.label === 'Calendar') && plan !== 'TEAM') {
              return (
                <div key={item.label} className="sidebar-link opacity-50 cursor-not-allowed" onClick={() => navigate(`/workspaces/${workspaceId}/billing`)}>
                  {item.icon}
                  <span>{item.label}</span>
                  <span className="ml-auto text-[10px] text-violet-400">TEAM</span>
                </div>
              )
            }
            return (
              <NavLink
                key={item.label}
                to={workspaceId ? item.to(workspaceId) : '#'}
                end={item.end}
                className={({ isActive }) =>
                  `sidebar-link ${isActive && workspaceId ? 'active' : ''}`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-[#2e2e3e]/60">
          <button
            onClick={() => navigate('/workspaces')}
            className="sidebar-link w-full text-left"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            All Workspaces
          </button>
        </div>
      </nav>

      {/* User Footer */}
      <div className="px-3 pb-4 border-t border-[#2e2e3e]/60 pt-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors group">
          <Avatar name={user?.name || 'User'} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-[#f1f1f8] truncate">{user?.name || 'User'}</div>
            <div className="text-xs text-[#8b8ba8] truncate">{user?.email}</div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-white/10 text-[#8b8ba8] hover:text-red-400 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )
}
