import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../services/api'
import { useDispatch } from 'react-redux'
import { addToast } from '../store/uiSlice'
import AppLayout from '../components/layout/AppLayout'
import Modal from '../components/ui/Modal'
import Avatar, { AvatarGroup } from '../components/ui/Avatar'
import { getSocket } from '../services/socket'

const STATUSES = ['Todo', 'In Progress', 'Done']
const PRIORITIES = ['Low', 'Medium', 'High']
const STATUS_CONFIG = {
  'Todo': { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', dot: 'bg-slate-400' },
  'In Progress': { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', dot: 'bg-blue-400' },
  'Done': { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
}
const PRIORITY_CONFIG = {
  'High': { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  'Medium': { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  'Low': { color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
}

function PriorityIcon({ priority }) {
  const colors = { High: 'text-red-400', Medium: 'text-amber-400', Low: 'text-teal-400' }
  return (
    <svg className={`w-3.5 h-3.5 ${colors[priority] || 'text-[#8b8ba8]'}`} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
  )
}

function TaskCard({ task, onClick }) {
  const cfg = STATUS_CONFIG[task.status] || STATUS_CONFIG['Todo']
  const pri = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG['Medium']
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done'

  return (
    <div onClick={() => onClick(task)} className="kanban-task group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-medium text-[#f1f1f8] line-clamp-2 flex-1">{task.title}</h4>
        <PriorityIcon priority={task.priority} />
      </div>

      {task.description && (
        <p className="text-xs text-[#8b8ba8] line-clamp-2 mb-3">{task.description}</p>
      )}

      <div className="flex items-center justify-between gap-2 mt-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`badge text-[10px] ${pri.bg} ${pri.color} border ${pri.border}`}>
            {task.priority}
          </span>
          {task.dueDate && (
            <span className={`text-[10px] flex items-center gap-1 ${isOverdue ? 'text-red-400' : 'text-[#8b8ba8]'}`}>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
        {task.assignees?.length > 0 && (
          <AvatarGroup names={task.assignees.map(a => a.name || a.email)} max={2} size="xs" />
        )}
      </div>
    </div>
  )
}

function KanbanColumn({ status, tasks, onAddTask, onTaskClick }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <div className="kanban-column flex-shrink-0" style={{ width: '320px' }}>
      <div className="kanban-column-header">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
          <span className={`text-sm font-semibold ${cfg.color}`}>{status}</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-md bg-white/5 text-[10px] text-[#8b8ba8] font-medium">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(status)}
          className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#8b8ba8] hover:text-[#f1f1f8] transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      <div className="p-3 space-y-2 flex-1 overflow-y-auto min-h-[100px] max-h-[calc(100vh-280px)]">
        {tasks.map(task => (
          <TaskCard key={task._id} task={task} onClick={onTaskClick} />
        ))}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-2xl mb-2 opacity-30">📋</div>
            <p className="text-xs text-[#8b8ba8]">No tasks here</p>
          </div>
        )}
      </div>
    </div>
  )
}

function TaskModal({ task, projectId, workspaceId, members, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'Todo',
    priority: task?.priority || 'Medium',
    dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : '',
    assignees: task?.assignees?.map(a => a._id || a) || [],
  })
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deletingAttachment, setDeletingAttachment] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const dispatch = useDispatch()
  const role = useSelector(s => s.workspace.currentRole)

  // Fetch comments if editing
  useEffect(() => {
    if (task?._id) {
      setLoadingComments(true)
      api.get(`/workspaces/${workspaceId}/comments/${task._id}/comments`)
        .then(r => setComments(r.data || []))
        .catch(() => {})
        .finally(() => setLoadingComments(false))
    }
  }, [task?._id, workspaceId])

  async function handleAddComment() {
    if (!newComment.trim()) return
    try {
      const r = await api.post(`/workspaces/${workspaceId}/comments/${task._id}/comments`, { content: newComment })
      setComments([r.data, ...comments])
      setNewComment('')
    } catch {
      dispatch(addToast({ type: 'error', title: 'Failed to post comment' }))
    }
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const r = await api.post(`/workspaces/${workspaceId}/uploads/${projectId}/tasks/${task._id}/attachment`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      onSave(r.data.task, true)
      dispatch(addToast({ type: 'success', title: 'Attachment uploaded' }))
    } catch {
      dispatch(addToast({ type: 'error', title: 'Failed to upload attachment' }))
    } finally {
      setUploading(false)
    }
  }

  async function handleDeleteAttachment(atId) {
    if (!window.confirm('Delete this attachment?')) return
    setDeletingAttachment(atId)
    try {
      const r = await api.delete(`/workspaces/${workspaceId}/uploads/${projectId}/tasks/${task._id}/attachment/${atId}`)
      onSave(r.data.task, true)
      dispatch(addToast({ type: 'success', title: 'Attachment deleted' }))
    } catch {
      dispatch(addToast({ type: 'error', title: 'Failed to delete attachment' }))
    } finally {
      setDeletingAttachment(null)
    }
  }

  async function handleSave() {
    if (!form.title.trim()) { setError('Title is required'); return }
    setSaving(true)
    setError('')
    try {
      const payload = { ...form, dueDate: form.dueDate || undefined }
      let r
      if (task?._id) {
        r = await api.patch(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${task._id}`, payload)
      } else {
        r = await api.post(`/workspaces/${workspaceId}/projects/${projectId}/tasks`, payload)
      }
      onSave(r.data, !!task?._id)
      dispatch(addToast({ type: 'success', title: task?._id ? 'Task updated' : 'Task created' }))
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this task?')) return
    setDeleting(true)
    try {
      await api.delete(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${task._id}`)
      onDelete(task._id)
      dispatch(addToast({ type: 'success', title: 'Task deleted' }))
      onClose()
    } catch {
      dispatch(addToast({ type: 'error', title: 'Failed to delete task' }))
    } finally {
      setDeleting(false)
    }
  }

  const canDelete = task?._id && (role === 'Owner' || role === 'Admin')

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {error && <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

        <div className="form-group">
          <label className="label">Title *</label>
          <input className="input" placeholder="Task title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} autoFocus />
        </div>

        <div className="form-group">
          <label className="label">Description</label>
          <textarea
            className="input"
            placeholder="Add a description..."
            rows={3}
            value={form.description}
            onChange={e => setForm({...form, description: e.target.value})}
            style={{ resize: 'vertical' }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="form-group">
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Priority</label>
            <select className="input" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="label">Due Date</label>
          <input className="input" type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
        </div>

        {members.length > 0 && (
          <div className="form-group">
            <label className="label">Assignees</label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {members.map(m => (
                <label key={m._id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.assignees.includes(m._id)}
                    onChange={e => {
                      if (e.target.checked) setForm({...form, assignees: [...form.assignees, m._id]})
                      else setForm({...form, assignees: form.assignees.filter(id => id !== m._id)})
                    }}
                    className="w-4 h-4 rounded border-[#2e2e3e] accent-indigo-600"
                  />
                  <Avatar name={m.name || m.email} size="xs" />
                  <span className="text-sm text-[#f1f1f8]">{m.name || m.email}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {task?._id ? (
        <>
          <hr className="border-white/5" />
          
          {/* Attachments Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="label mb-0 uppercase text-[11px] tracking-wider">Attachments</label>
              <label className="btn-ghost btn-xs cursor-pointer relative">
                {uploading ? <span className="spinner w-3.5 h-3.5" /> : (
                  <>
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add
                  </>
                )}
                <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
              </label>
            </div>
            
            {task.attachments?.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {task.attachments.map((at, idx) => {
                  if (!at) return null;
                  const isObject = typeof at === 'object' && at !== null;
                  const url = isObject ? at.url : at;
                  if (!url) return null;
                  
                  const name = isObject ? at.name : (url.split?.('/').pop() || 'Attachment');
                  const date = isObject ? at.uploadedAt : null;
                  const atId = isObject ? at._id : idx;

                  const isImage = /\.(jpeg|jpg|png|gif|webp)$/i.test(name) || url.includes?.('image/upload');
                  const isVideo = /\.(mp4|webm|mov|quicktime)$/i.test(name) || url.includes?.('video/upload');
                  const isPdf = /\.pdf$/i.test(name);
                  const isDoc = /\.(doc|docx)$/i.test(name);
                  const isSheet = /\.(xls|xlsx)$/i.test(name);
                  const isZip = /\.(zip|rar|7z)$/i.test(name);
                  const isTxt = /\.txt$/i.test(name);

                  return (
                    <div key={atId} className="space-y-2 group/item">
                      <div className="flex items-center gap-2">
                        <a 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all group"
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isImage ? 'bg-emerald-500/10 text-emerald-400' :
                            isVideo ? 'bg-amber-500/10 text-amber-400' :
                            isPdf ? 'bg-red-500/10 text-red-400' :
                            isDoc ? 'bg-blue-500/10 text-blue-400' :
                            isSheet ? 'bg-green-500/10 text-green-400' :
                            isZip ? 'bg-purple-500/10 text-purple-400' :
                            isTxt ? 'bg-slate-500/10 text-slate-400' :
                            'bg-indigo-500/10 text-indigo-400'
                          }`}>
                            {isImage && (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            )}
                            {isVideo && (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                            {isPdf && (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            )}
                            {isDoc && (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            )}
                            {isSheet && (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            )}
                            {isZip && (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                              </svg>
                            )}
                            {isTxt && (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                              </svg>
                            )}
                            {!isImage && !isVideo && !isPdf && !isDoc && !isSheet && !isZip && !isTxt && (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-[#f1f1f8] truncate">{name}</p>
                            <p className="text-[10px] text-[#8b8ba8]">
                              Uploaded {date ? `on ${new Date(date).toLocaleDateString()}` : 'view file'}
                            </p>
                          </div>
                          <svg className="w-4 h-4 text-[#8b8ba8] opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                        {atId && (
                          <button 
                            onClick={(e) => { e.preventDefault(); handleDeleteAttachment(atId); }}
                            disabled={deletingAttachment === atId}
                            className="w-10 h-10 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-red-400 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all"
                          >
                            {deletingAttachment === atId ? (
                              <span className="spinner w-4 h-4" />
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                      
                      {/* Preview for images/videos */}
                      {isImage && (
                        <div className="px-1">
                          <img src={url} alt={name} className="w-full max-h-48 object-cover rounded-lg border border-white/5" />
                        </div>
                      )}
                      {isVideo && (
                        <div className="px-1">
                          <video src={url} controls className="w-full max-h-48 rounded-lg border border-white/5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[#8b8ba8] italic">No attachments yet</p>
            )}
          </div>

          <hr className="border-white/5" />

          {/* Comments Section */}
          <div className="space-y-4">
            <label className="label uppercase text-[11px] tracking-wider">Comments</label>
            
            <div className="flex gap-3">
              <Avatar name="Me" size="sm" />
              <div className="flex-1 space-y-2">
                <textarea 
                  className="input text-sm min-h-[80px]" 
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                />
                <div className="flex justify-end">
                  <button 
                    onClick={handleAddComment} 
                    disabled={!newComment.trim()}
                    className="btn-primary btn-sm"
                  >
                    Post Comment
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              {loadingComments ? (
                <div className="flex justify-center py-4"><span className="spinner w-5 h-5" /></div>
              ) : comments.length > 0 ? (
                comments.map(c => (
                  <div key={c._id} className="flex gap-3">
                    <Avatar name={c.author?.name || c.author?.email || 'User'} size="sm" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-[#f1f1f8]">{c.author?.name || c.author?.email}</span>
                        <span className="text-[10px] text-[#8b8ba8]">{new Date(c.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-[#8b8ba8] leading-relaxed whitespace-pre-wrap">
                        {c.content}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#8b8ba8] italic text-center py-4">No comments yet</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
          <p className="text-xs text-[#8b8ba8] text-center">
            You can add attachments and comments after creating the task.
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 pt-4 border-t border-white/5">
        {canDelete && (
          <button onClick={handleDelete} disabled={deleting} className="btn-danger btn-sm">
            {deleting ? '...' : 'Delete'}
          </button>
        )}
        <div className="flex-1" />
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? <><span className="spinner w-4 h-4" />{task?._id ? 'Saving...' : 'Creating...'}</> : (task?._id ? 'Save changes' : 'Create task')}
        </button>
      </div>
    </div>
  )
}

export default function ProjectBoard() {
  const { workspaceId, projectId } = useParams()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [defaultStatus, setDefaultStatus] = useState('Todo')
  const [filter, setFilter] = useState({ status: '', priority: '', search: '' })
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const loadData = useCallback(() => {
    if (!workspaceId || !projectId) return
    Promise.all([
      api.get(`/workspaces/${workspaceId}/projects/${projectId}`),
      api.get(`/workspaces/${workspaceId}/tasks`, { params: { project: projectId } }),
      api.get(`/workspaces/${workspaceId}/members`),
    ]).then(([p, t, m]) => {
      setProject(p.data)
      setTasks(t.data || [])
      setMembers(m.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [workspaceId, projectId])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Real-time task updates
  useEffect(() => {
    const s = getSocket()
    if (!s) return

    const onCreated = (task) => {
      if (String(task.project) === projectId) {
        setTasks(prev => {
          // Prevent duplicates by checking if task already exists
          if (prev.some(t => t._id === task._id)) return prev;
          return [task, ...prev];
        })
      }
    }

    const onUpdated = (task) => {
      if (String(task.project) === projectId) {
        setTasks(prev => {
          const exists = prev.some(t => t._id === task._id);
          if (exists) {
            return prev.map(t => t._id === task._id ? task : t);
          }
          return [task, ...prev];
        })
      }
    }

    const onDeleted = ({ taskId }) => {
      setTasks(prev => prev.filter(t => t._id !== taskId))
    }

    // Remove any existing listeners first to prevent duplicates from strict mode
    s.off('task.created', onCreated)
    s.off('task.updated', onUpdated)
    s.off('task.deleted', onDeleted)

    s.on('task.created', onCreated)
    s.on('task.updated', onUpdated)
    s.on('task.deleted', onDeleted)

    return () => {
      s.off('task.created', onCreated)
      s.off('task.updated', onUpdated)
      s.off('task.deleted', onDeleted)
    }
  }, [projectId])

  function openAddTask(status) {
    setSelectedTask(null)
    setDefaultStatus(status)
    setModalOpen(true)
  }

  function openEditTask(task) {
    setSelectedTask(task)
    setModalOpen(true)
  }

  function handleSave(task, isUpdate) {
    setTasks(prev => {
      const exists = prev.some(t => t._id === task._id);
      if (isUpdate || exists) {
        return prev.map(t => t._id === task._id ? task : t);
      }
      return [task, ...prev];
    })
    if (selectedTask?._id === task._id) {
      setSelectedTask(task)
    }
  }

  function handleDelete(taskId) {
    setTasks(prev => prev.filter(t => t._id !== taskId))
  }

  const filteredTasks = tasks.filter(t => {
    if (filter.status && t.status !== filter.status) return false
    if (filter.priority && t.priority !== filter.priority) return false
    if (filter.search && !t.title.toLowerCase().includes(filter.search.toLowerCase())) return false
    return true
  })

  const tasksByStatus = STATUSES.reduce((acc, s) => {
    acc[s] = filteredTasks.filter(t => t.status === s)
    return acc
  }, {})

  if (loading) {
    return (
      <AppLayout title="Project Board">
        <div className="flex items-center justify-center h-64">
          <span className="spinner w-8 h-8" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title={project?.name || 'Project Board'}>
      <div className="max-w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-[#8b8ba8] text-sm mb-1">
              <button onClick={() => navigate(`/workspaces/${workspaceId}/projects`)} className="hover:text-indigo-400 transition-colors">
                Projects
              </button>
              <span>/</span>
              <span className="text-[#f1f1f8]">{project?.name}</span>
            </div>
            {project?.description && (
              <p className="text-sm text-[#8b8ba8]">{project.description}</p>
            )}
          </div>
          <button onClick={() => openAddTask('Todo')} className="btn-primary btn-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <input
            className="input text-sm"
            style={{ width: '220px' }}
            placeholder="🔍 Search tasks..."
            value={filter.search}
            onChange={e => setFilter({...filter, search: e.target.value})}
          />
          <select className="input text-sm" style={{ width: '140px' }} value={filter.status} onChange={e => setFilter({...filter, status: e.target.value})}>
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="input text-sm" style={{ width: '140px' }} value={filter.priority} onChange={e => setFilter({...filter, priority: e.target.value})}>
            <option value="">All Priority</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          {(filter.status || filter.priority || filter.search) && (
            <button onClick={() => setFilter({ status: '', priority: '', search: '' })} className="btn-ghost btn-sm">
              Clear filters
            </button>
          )}
          <div className="ml-auto text-xs text-[#8b8ba8]">{filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}</div>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hidden">
          {STATUSES.map(status => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={tasksByStatus[status]}
              onAddTask={openAddTask}
              onTaskClick={openEditTask}
            />
          ))}
        </div>
      </div>

      {/* Task Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedTask ? 'Edit Task' : 'New Task'}
        size="md"
      >
        <TaskModal
          key={selectedTask?._id || 'new'}
          task={selectedTask ? { ...selectedTask, status: selectedTask.status } : { status: defaultStatus }}
          projectId={projectId}
          workspaceId={workspaceId}
          members={members}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      </Modal>
    </AppLayout>
  )
}
