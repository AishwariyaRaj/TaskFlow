import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import api from '../services/api'
import store from '../store'
import { addToast } from '../store/uiSlice'
import { updateUser, setAuth } from '../store/authSlice'
import { setWorkspaceList, setCurrentWorkspace } from '../store/workspaceSlice'

export default function AcceptInvite() {
  const { token } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, accessToken } = useSelector(state => state.auth)
  const isAuthenticated = !!user // Derive from user existence
  
  const [loading, setLoading] = useState(true)
  const [invite, setInvite] = useState(null)
  const [error, setError] = useState(null)
  const [accepting, setAccepting] = useState(false)

  const [authChecking, setAuthChecking] = useState(!isAuthenticated)

  // Try to restore session if not authenticated in Redux
  useEffect(() => {
    console.log('[ACCEPT] Initial auth check. isAuthenticated:', isAuthenticated)
    
    if (isAuthenticated) {
      console.log('[ACCEPT] Already authenticated, skipping restoration')
      setAuthChecking(false)
      return
    }
    
    // Check if token is in localStorage
    const savedAuth = localStorage.getItem('auth')
    console.log('[ACCEPT] Auth in localStorage:', savedAuth ? 'YES' : 'NO')
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth)
        console.log('[ACCEPT] Restored from localStorage:', parsed.user?.email)
        dispatch(setAuth({ accessToken: parsed.accessToken, user: parsed.user }))
        setAuthChecking(false)
        return
      } catch (e) {
        console.log('[ACCEPT] Failed to parse localStorage auth:', e.message)
      }
    }
    
    // Try to restore session from server
    console.log('[ACCEPT] Attempting to restore auth from server...')
    api.get('/auth/me')
      .then(r => {
        console.log('[ACCEPT] Restored auth from /auth/me:', r.data.email)
        dispatch(setAuth({ accessToken: store.getState().auth.accessToken, user: r.data }))
      })
      .catch(() => {
        console.log('[ACCEPT] /auth/me failed, trying refresh')
        return api.post('/auth/refresh')
          .then(r => {
            console.log('[ACCEPT] Got new token from refresh')
            dispatch(setAuth({ accessToken: r.data.accessToken, user: r.data.user }))
          })
          .catch(err => {
            console.log('[ACCEPT] Refresh also failed, user not authenticated')
          })
      })
      .finally(() => {
        console.log('[ACCEPT] Auth restoration complete')
        setAuthChecking(false)
      })
  }, [isAuthenticated, dispatch])

  useEffect(() => {
    async function loadInvite() {
      try {
        const res = await api.get(`/invites/${token}`)
        setInvite(res.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid or expired invite')
      } finally {
        setLoading(false)
      }
    }
    loadInvite()
  }, [token])

  async function handleAccept() {
    setAccepting(true)
    try {
      console.log(`[ACCEPT] Starting invite acceptance for token: ${token}`)
      console.log(`[ACCEPT] Invite email: ${invite?.email}`)
      console.log(`[ACCEPT] User authenticated: ${user ? user.email : 'NO'}`)
      
      // POST without authentication requirement - backend will validate email
      const res = await api.post(`/invites/${token}/accept`, { 
        email: invite?.email 
      })
      console.log(`[ACCEPT] Success response:`, res.data)
      
      // Update Redux with returned user/workspace data
      if (res.data.user) {
        console.log(`[ACCEPT] Updating Redux with user:`, res.data.user)
        dispatch(setAuth({ 
          accessToken: store.getState().auth.accessToken || res.data.accessToken, 
          user: res.data.user 
        }))
      }
      
      if (res.data.workspace) {
        const workspaceItem = {
          workspace: res.data.workspace,
          role: res.data.role
        }
        console.log(`[ACCEPT] Updating workspace list:`, workspaceItem)
        dispatch(setWorkspaceList([workspaceItem, ...store.getState().workspace.list]))
        dispatch(setCurrentWorkspace(workspaceItem))
      }
      
      dispatch(addToast({ type: 'success', title: '🎉 Invite accepted! Welcome to the workspace.' }))
      navigate(`/workspaces/${res.data.workspaceId}`)
    } catch (err) {
      console.error(`[ACCEPT] Error accepting invite:`, err)
      console.error(`[ACCEPT] Error response:`, err.response?.data)
      setError(err.response?.data?.message || 'Failed to accept invite')
      setAccepting(false)
    }
  }

  if (loading || authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#13131a]">
        <span className="spinner w-8 h-8" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#13131a] p-4">
        <div className="card max-w-md w-full p-8 text-center space-y-4">
          <div className="text-red-400 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-[#f1f1f8]">Invite Error</h2>
          <p className="text-[#8b8ba8]">{error}</p>
          <button onClick={() => navigate('/workspaces')} className="btn-primary w-full mt-4">
            Go to Workspaces
          </button>
        </div>
      </div>
    )
  }

  // If not logged in, user needs to log in or register first
  if (!isAuthenticated) {
    const returnUrl = encodeURIComponent(`/invites/${token}`)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#13131a] p-4">
        <div className="card max-w-md w-full p-8 text-center space-y-4">
          <div className="text-4xl mb-2">📩</div>
          <h2 className="text-xl font-bold text-[#f1f1f8]">Join {invite?.workspace?.name}</h2>
          <p className="text-[#8b8ba8]">
            You've been invited to join <strong>{invite?.workspace?.name}</strong> as <strong>{invite?.role}</strong>.
            Please log in or create an account with <strong>{invite?.email}</strong> to accept.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button onClick={() => navigate(`/login?redirect=${returnUrl}`)} className="btn-secondary">Log In</button>
            <button onClick={() => navigate(`/register?redirect=${returnUrl}`)} className="btn-primary">Sign Up</button>
          </div>
        </div>
      </div>
    )
  }

  // Logged in but email doesn't match
  if (user?.email?.toLowerCase() !== invite?.email?.toLowerCase()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#13131a] p-4">
        <div className="card max-w-md w-full p-8 text-center space-y-4">
          <div className="text-red-400 text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-[#f1f1f8]">Account Mismatch</h2>
          <p className="text-[#8b8ba8]">
            This invite was sent to <strong>{invite?.email}</strong>, but you are logged in as <strong>{user?.email}</strong>.
          </p>
          <button onClick={() => navigate('/workspaces')} className="btn-secondary w-full mt-4">
            Go to Workspaces
          </button>
        </div>
      </div>
    )
  }

  // Ready to accept
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#13131a] p-4">
      <div className="card max-w-md w-full p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mx-auto mb-2">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#f1f1f8] mb-2">Join Workspace</h2>
          <p className="text-[#8b8ba8]">
            <strong>{invite?.invitedBy?.name || invite?.invitedBy?.email}</strong> has invited you to join <strong>{invite?.workspace?.name}</strong>.
          </p>
        </div>
        <button 
          onClick={handleAccept} 
          disabled={accepting} 
          className="btn-primary w-full py-2.5 text-base"
        >
          {accepting ? <><span className="spinner w-5 h-5 mr-2" /> Accepting...</> : 'Accept Invitation'}
        </button>
      </div>
    </div>
  )
}
