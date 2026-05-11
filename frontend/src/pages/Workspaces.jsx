import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { setWorkspaceList, setCurrentWorkspace, addWorkspace } from '../store/workspaceSlice'
import { addToast } from '../store/uiSlice'
import { clearAuth } from '../store/authSlice'
import { connectSocket } from '../services/socket'
import api from '../services/api'
import { Navigate } from 'react-router-dom'
import Modal from '../components/ui/Modal'
import ToastContainer from '../components/ui/Toast'
import Avatar from '../components/ui/Avatar'

function WorkspaceCard({ item, onSelect }) {
  const plan = item.workspace?.plan || 'FREE'
  const planLabel = plan === 'FREE' ? 'Free' : plan
  const planBadge = {
    FREE: 'badge-member',
    PRO: 'badge-in-progress',
    TEAM: 'badge-owner',
  }[plan] || 'badge-member'

  return (
    <div
      onClick={() => onSelect(item)}
      className="card-hover cursor-pointer p-6 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xl font-bold shadow-glow-sm group-hover:shadow-glow transition-shadow">
          {item.workspace?.name?.[0]?.toUpperCase() || 'W'}
        </div>
        <span className={planBadge}>{planLabel}</span>
      </div>
      <h3 className="font-semibold text-[#f1f1f8] text-lg mb-1">{item.workspace?.name}</h3>
      <p className="text-sm text-[#8b8ba8] mb-4">/{item.workspace?.slug}</p>
      <div className="flex items-center justify-between">
        <span className={`badge-${item.role?.toLowerCase() || 'member'}`}>{item.role}</span>
        <svg className="w-5 h-5 text-[#8b8ba8] group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  )
}

export default function Workspaces() {
  const token = useSelector(s => s.auth.accessToken)
  const user = useSelector(s => s.auth.user)
  const workspaces = useSelector(s => s.workspace.list)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', slug: '' })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  if (!token) return <Navigate to="/login" replace />

  useEffect(() => {
    if (token) {
      try { connectSocket(token) } catch {}
    }
    // Add a small delay to ensure backend has persisted the invite acceptance
    const timer = setTimeout(() => {
      api.get('/workspaces')
        .then(r => {
          const workspaceList = r.data || [];
          console.log(`[WORKSPACES] Fetched ${workspaceList.length} workspaces`);
          dispatch(setWorkspaceList(workspaceList));
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch workspaces:', err.response?.status, err.response?.data);
          setLoading(false);
        });
    }, 300); // Small delay to ensure database is consistent
    return () => clearTimeout(timer);
  }, [dispatch]);

  function handleSelect(item) {
    dispatch(setCurrentWorkspace(item))
    navigate(`/workspaces/${item.workspace._id}`)
  }

  async function handleCreate(e) {
    e.preventDefault()
    setCreateError('')
    setCreating(true)
    try {
      const r = await api.post('/workspaces', createForm)
      dispatch(addWorkspace(r.data))
      dispatch(setCurrentWorkspace({ workspace: r.data, role: 'Owner' }))
      dispatch(addToast({ type: 'success', title: 'Workspace created!', message: r.data.name }))
      setShowCreate(false)
      setCreateForm({ name: '', slug: '' })
      navigate(`/workspaces/${r.data._id}`)
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create workspace')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#0f0f13' }}>
      {/* Header */}
      <div className="border-b border-[#2e2e3e]/60 px-8 py-5" style={{ background: 'rgba(26,26,36,0.8)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
              T
            </div>
            <span className="font-bold text-[#f1f1f8] text-lg" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              TaskFlow
            </span>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2 text-sm text-[#8b8ba8]">
                <Avatar name={user.name} size="sm" />
                <span>{user.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-10 page-transition">
        {/* Hero */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-600/10 border border-indigo-600/20 text-indigo-400 text-xs font-medium mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </div>
          <h1 className="text-3xl font-bold text-[#f1f1f8] mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Your Workspaces
          </h1>
          <p className="text-[#8b8ba8]">Select a workspace to get started, or create a new one.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card h-40 shimmer" />
            ))}
          </div>
        ) : workspaces.length === 0 ? (
          <div className="empty-state mt-20">
            <div className="empty-state-icon text-4xl">🚀</div>
            <h3 className="text-lg font-semibold text-[#f1f1f8] mb-2">No workspaces yet</h3>
            <p className="text-sm text-[#8b8ba8] mb-6">Create your first workspace to start collaborating with your team.</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary">
              Create Workspace
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {workspaces.map(item => (
                <WorkspaceCard key={item.workspace?._id} item={item} onSelect={handleSelect} />
              ))}
              {/* Create New */}
              <button
                onClick={() => setShowCreate(true)}
                className="card flex flex-col items-center justify-center gap-3 text-[#8b8ba8] hover:text-indigo-400 hover:border-indigo-500/30 transition-all group cursor-pointer min-h-[140px]"
              >
                <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-[#2e2e3e] group-hover:border-indigo-500/50 flex items-center justify-center transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Create new workspace</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Create Workspace Modal */}
      <Modal open={showCreate} onClose={() => { setShowCreate(false); setCreateError('') }} title="Create Workspace">
        <form onSubmit={handleCreate} className="space-y-4">
          {createError && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {createError}
            </div>
          )}
          <div className="form-group">
            <label className="label">Workspace name</label>
            <input
              id="workspace-name"
              className="input"
              placeholder="e.g. Acme Corp"
              value={createForm.name}
              onChange={e => {
                const name = e.target.value
                const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                setCreateForm({ name, slug })
              }}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="label">Slug (URL identifier)</label>
            <input
              id="workspace-slug"
              className="input"
              placeholder="e.g. acme-corp"
              value={createForm.slug}
              onChange={e => setCreateForm({ ...createForm, slug: e.target.value })}
              pattern="[a-z0-9-]+"
              title="Lowercase letters, numbers, and hyphens only"
            />
            <p className="text-xs text-[#8b8ba8] mt-1">Lowercase, letters, numbers and hyphens only</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={creating} className="btn-primary flex-1">
              {creating ? <><span className="spinner w-4 h-4" />Creating...</> : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ToastContainer />
    </div>
  )
}
