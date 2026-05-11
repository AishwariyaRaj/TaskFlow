import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import api from '../services/api'
import { addToast } from '../store/uiSlice'
import AppLayout from '../components/layout/AppLayout'
import Modal from '../components/ui/Modal'
import Avatar from '../components/ui/Avatar'

export default function MembersPage() {
  const { workspaceId } = useParams()
  const dispatch = useDispatch()
  const role = useSelector(s => s.workspace.currentRole)
  const [members, setMembers] = useState([])
  const [invites, setInvites] = useState([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'Member' })
  const [inviting, setInviting] = useState(false)

  const canManage = role === 'Owner' || role === 'Admin'

  useEffect(() => {
    if (!workspaceId) return
    Promise.all([
      api.get(`/workspaces/${workspaceId}/members`),
      canManage ? api.get(`/workspaces/${workspaceId}/invites`) : Promise.resolve({ data: [] })
    ]).then(([m, i]) => {
      setMembers(m.data || [])
      setInvites(i.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [workspaceId, canManage])

  async function handleInvite(e) {
    e.preventDefault()
    setInviting(true)
    try {
      const r = await api.post(`/workspaces/${workspaceId}/invites`, inviteForm)
      dispatch(addToast({ type: 'success', title: 'Invite sent!', message: `Invitation sent to ${inviteForm.email}` }))
      setInvites(prev => [r.data, ...prev])
      setShowInvite(false)
      setInviteForm({ email: '', role: 'Member' })
    } catch (err) {
      dispatch(addToast({ type: 'error', title: 'Failed to send invite', message: err.response?.data?.message }))
    } finally {
      setInviting(false)
    }
  }

  async function handleRoleChange(userId, newRole) {
    try {
      await api.patch(`/workspaces/${workspaceId}/members/${userId}`, { role: newRole })
      setMembers(prev => prev.map(m => m._id === userId ? { ...m, role: newRole } : m))
      dispatch(addToast({ type: 'success', title: 'Role updated' }))
    } catch (err) {
      dispatch(addToast({ type: 'error', title: 'Failed to update role', message: err.response?.data?.message }))
    }
  }

  async function handleRemove(member) {
    if (!window.confirm(`Remove ${member.name} from this workspace?`)) return
    try {
      await api.delete(`/workspaces/${workspaceId}/members/${member._id}`)
      setMembers(prev => prev.filter(m => m._id !== member._id))
      dispatch(addToast({ type: 'success', title: 'Member removed' }))
    } catch (err) {
      dispatch(addToast({ type: 'error', title: 'Failed to remove member', message: err.response?.data?.message }))
    }
  }

  async function handleDeleteInvite(inviteId) {
    try {
      await api.delete(`/workspaces/${workspaceId}/invites/${inviteId}`)
      setInvites(prev => prev.filter(i => i._id !== inviteId))
      dispatch(addToast({ type: 'success', title: 'Invite revoked' }))
    } catch {
      dispatch(addToast({ type: 'error', title: 'Failed to revoke invite' }))
    }
  }

  const roleBadge = { Owner: 'badge-owner', Admin: 'badge-admin', Member: 'badge-member' }

  return (
    <AppLayout title="Members">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="page-title">Members</h1>
            <p className="page-subtitle">{members.length} member{members.length !== 1 ? 's' : ''} in this workspace</p>
          </div>
          {canManage && (
            <button onClick={() => setShowInvite(true)} className="btn-primary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Invite Member
            </button>
          )}
        </div>

        {/* Members Table */}
        <div className="card p-0 overflow-hidden mb-6">
          {loading ? (
            <div className="p-8 text-center"><span className="spinner w-6 h-6" /></div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  {canManage && <th className="text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={m.name || m.email} size="sm" />
                        <span className="font-medium text-[#f1f1f8]">{m.name || '—'}</span>
                      </div>
                    </td>
                    <td className="text-[#8b8ba8]">{m.email}</td>
                    <td>
                      {canManage && m.role !== 'Owner' ? (
                        <select
                          className="input text-xs py-1"
                          style={{ width: '100px' }}
                          value={m.role}
                          onChange={e => handleRoleChange(m._id, e.target.value)}
                        >
                          <option value="Admin">Admin</option>
                          <option value="Member">Member</option>
                        </select>
                      ) : (
                        <span className={roleBadge[m.role] || 'badge-member'}>{m.role}</span>
                      )}
                    </td>
                    <td className="text-[#8b8ba8] text-sm">
                      {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : '—'}
                    </td>
                    {canManage && (
                      <td className="text-right">
                        {m.role !== 'Owner' && (
                          <button
                            onClick={() => handleRemove(m)}
                            className="btn-ghost btn-sm text-[#8b8ba8] hover:text-red-400"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pending Invites */}
        {canManage && invites.length > 0 && (
          <div>
            <h2 className="section-title mb-3">Pending Invites</h2>
            <div className="card p-0 overflow-hidden">
              <table className="table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Invited By</th>
                    <th>Expires</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invites.map(inv => (
                    <tr key={inv._id}>
                      <td className="text-[#f1f1f8]">{inv.email}</td>
                      <td><span className={roleBadge[inv.role] || 'badge-member'}>{inv.role}</span></td>
                      <td className="text-[#8b8ba8] text-sm">{inv.invitedBy?.name || '—'}</td>
                      <td className="text-sm text-[#8b8ba8]">
                        {new Date(inv.expiresAt) < new Date()
                          ? <span className="text-red-400">Expired</span>
                          : new Date(inv.expiresAt).toLocaleDateString()
                        }
                      </td>
                      <td>
                        <span className={inv.accepted ? 'badge-done' : 'badge-todo'}>
                          {inv.accepted ? 'Accepted' : 'Pending'}
                        </span>
                      </td>
                      <td className="text-right">
                        {!inv.accepted && (
                          <button onClick={() => handleDeleteInvite(inv._id)} className="btn-ghost btn-sm text-[#8b8ba8] hover:text-red-400">
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Invite Team Member">
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="form-group">
            <label className="label">Email address</label>
            <input
              id="invite-email"
              className="input"
              type="email"
              placeholder="colleague@company.com"
              value={inviteForm.email}
              onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="label">Role</label>
            <select
              id="invite-role"
              className="input"
              value={inviteForm.role}
              onChange={e => setInviteForm({ ...inviteForm, role: e.target.value })}
            >
              <option value="Member">Member</option>
              <option value="Admin">Admin</option>
            </select>
            <p className="text-xs text-[#8b8ba8] mt-1.5">Admins can manage members and projects. Members can create and update tasks.</p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-600/5 border border-indigo-600/20 text-xs text-[#8b8ba8]">
            An invitation email will be sent. The link is valid for 7 days.
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowInvite(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={inviting} className="btn-primary flex-1">
              {inviting ? <><span className="spinner w-4 h-4" />Sending...</> : 'Send Invite'}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  )
}
