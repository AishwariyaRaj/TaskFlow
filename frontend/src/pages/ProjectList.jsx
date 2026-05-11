import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import api from '../services/api'
import { addToast } from '../store/uiSlice'
import AppLayout from '../components/layout/AppLayout'
import Modal from '../components/ui/Modal'
import { getSocket } from '../services/socket'

export default function ProjectList() {
  const { workspaceId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const role = useSelector(s => s.workspace.currentRole)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [creating, setCreating] = useState(false)
  const [taskCounts, setTaskCounts] = useState({})

  useEffect(() => {
    if (!workspaceId) return
    api.get(`/workspaces/${workspaceId}/projects`)
      .then(r => {
        setProjects(r.data || [])
        setLoading(false)
        // Load task counts for each project
        Promise.all((r.data || []).map(p =>
          api.get(`/workspaces/${workspaceId}/tasks`, { params: { project: p._id } })
            .then(t => ({ id: p._id, total: t.data.length, done: t.data.filter(task => task.status === 'Done').length }))
            .catch(() => ({ id: p._id, total: 0, done: 0 }))
        )).then(counts => {
          const map = {}
          counts.forEach(c => { map[c.id] = c })
          setTaskCounts(map)
        })
      })
      .catch(() => setLoading(false))
  }, [workspaceId])

  // Real-time project events
  useEffect(() => {
    const s = getSocket()
    if (!s) return
    const onCreated = (p) => setProjects(prev => prev.some(existing => existing._id === p._id) ? prev : [p, ...prev])
    const onDeleted = ({ projectId }) => setProjects(prev => prev.filter(p => p._id !== projectId))
    s.on('project.created', onCreated)
    s.on('project.deleted', onDeleted)
    return () => { s.off('project.created', onCreated); s.off('project.deleted', onDeleted) }
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    setCreating(true)
    try {
      const r = await api.post(`/workspaces/${workspaceId}/projects`, form)
      setProjects(prev => prev.some(p => p._id === r.data._id) ? prev : [r.data, ...prev])
      setShowCreate(false)
      setForm({ name: '', description: '' })
      dispatch(addToast({ type: 'success', title: 'Project created!', message: r.data.name }))
    } catch (err) {
      dispatch(addToast({ type: 'error', title: 'Failed to create project', message: err.response?.data?.message }))
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(project) {
    if (!window.confirm(`Delete project "${project.name}" and all its tasks?`)) return
    try {
      await api.delete(`/workspaces/${workspaceId}/projects/${project._id}`)
      setProjects(prev => prev.filter(p => p._id !== project._id))
      dispatch(addToast({ type: 'success', title: 'Project deleted' }))
    } catch {
      dispatch(addToast({ type: 'error', title: 'Failed to delete project' }))
    }
  }

  const canCreate = role === 'Owner' || role === 'Admin' || role === 'Member'
  const canDelete = role === 'Owner' || role === 'Admin'

  const PROJECT_COLORS = [
    'from-indigo-600 to-violet-600',
    'from-blue-600 to-cyan-600',
    'from-emerald-600 to-teal-600',
    'from-rose-600 to-pink-600',
    'from-amber-600 to-orange-600',
    'from-fuchsia-600 to-purple-600',
  ]

  return (
    <AppLayout title="Projects">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="page-title">Projects</h1>
            <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} in this workspace</p>
          </div>
          {canCreate && (
            <button onClick={() => setShowCreate(true)} className="btn-primary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Project
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="card h-48 shimmer" />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3 className="text-lg font-semibold text-[#f1f1f8] mb-2">No projects yet</h3>
            <p className="text-sm text-[#8b8ba8] mb-6">Create your first project to start organizing tasks.</p>
            {canCreate && (
              <button onClick={() => setShowCreate(true)} className="btn-primary">Create Project</button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p, i) => {
              const counts = taskCounts[p._id]
              const progress = counts?.total > 0 ? Math.round((counts.done / counts.total) * 100) : 0
              const colorClass = PROJECT_COLORS[i % PROJECT_COLORS.length]

              return (
                <div key={p._id} className="card-hover group relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
                      {p.name[0]?.toUpperCase()}
                    </div>
                    {canDelete && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(p) }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-[#8b8ba8] hover:text-red-400 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <h3 className="font-semibold text-[#f1f1f8] text-lg mb-1 line-clamp-1">{p.name}</h3>
                  <p className="text-sm text-[#8b8ba8] mb-4 line-clamp-2 min-h-[40px]">{p.description || 'No description'}</p>

                  {counts && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-[#8b8ba8] mb-1.5">
                        <span>{counts.done}/{counts.total} tasks done</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="progress">
                        <div className="progress-bar" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#8b8ba8]">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => navigate(`/workspaces/${workspaceId}/projects/${p._id}`)}
                      className="btn-primary btn-sm"
                    >
                      Open Board
                    </button>
                  </div>
                </div>
              )
            })}

            {/* Create card */}
            {canCreate && (
              <button
                onClick={() => setShowCreate(true)}
                className="card flex flex-col items-center justify-center gap-3 text-[#8b8ba8] hover:text-indigo-400 hover:border-indigo-500/30 transition-all group cursor-pointer min-h-[200px]"
              >
                <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-[#2e2e3e] group-hover:border-indigo-500/50 flex items-center justify-center transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-sm font-medium">New project</span>
              </button>
            )}
          </div>
        )}
      </div>

      <Modal open={showCreate} onClose={() => { setShowCreate(false); setForm({ name: '', description: '' }) }} title="Create Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="form-group">
            <label className="label">Project name *</label>
            <input id="project-name" className="input" placeholder="e.g. Marketing Campaign" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required autoFocus />
          </div>
          <div className="form-group">
            <label className="label">Description</label>
            <textarea id="project-description" className="input" placeholder="What's this project about?" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ resize: 'vertical' }} />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={creating} className="btn-primary flex-1">
              {creating ? <><span className="spinner w-4 h-4" />Creating...</> : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  )
}
