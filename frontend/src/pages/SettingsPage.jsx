import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import api from '../services/api'
import { addToast } from '../store/uiSlice'
import { updateUser } from '../store/authSlice'
import { updateWorkspace } from '../store/workspaceSlice'
import AppLayout from '../components/layout/AppLayout'
import Avatar from '../components/ui/Avatar'

export default function SettingsPage() {
  const { workspaceId } = useParams()
  const dispatch = useDispatch()
  const user = useSelector(s => s.auth.user)
  const current = useSelector(s => s.workspace.current)
  const role = useSelector(s => s.workspace.currentRole)
  const [profileForm, setProfileForm] = useState({ name: user?.name || '' })
  const [workspaceForm, setWorkspaceForm] = useState({ name: current?.name || '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingWorkspace, setSavingWorkspace] = useState(false)

  const canManageWorkspace = role === 'Owner' || role === 'Admin'

  async function saveProfile(e) {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const r = await api.patch('/auth/me', profileForm)
      dispatch(updateUser(r.data))
      dispatch(addToast({ type: 'success', title: 'Profile updated!' }))
    } catch (err) {
      dispatch(addToast({ type: 'error', title: 'Failed to update profile', message: err.response?.data?.message }))
    } finally {
      setSavingProfile(false)
    }
  }

  async function saveWorkspace(e) {
    e.preventDefault()
    setSavingWorkspace(true)
    try {
      const r = await api.patch(`/workspaces/${workspaceId}`, workspaceForm)
      dispatch(updateWorkspace(r.data))
      dispatch(addToast({ type: 'success', title: 'Workspace updated!' }))
    } catch (err) {
      dispatch(addToast({ type: 'error', title: 'Failed to update workspace', message: err.response?.data?.message }))
    } finally {
      setSavingWorkspace(false)
    }
  }

  return (
    <AppLayout title="Settings">
      <div className="max-w-2xl mx-auto">
        <h1 className="page-title mb-6">Settings</h1>

        {/* Profile Settings */}
        <div className="card mb-6">
          <h2 className="section-title mb-5 pb-4 border-b border-[#2e2e3e]">Profile</h2>
          <div className="flex items-center gap-4 mb-5">
            <Avatar name={user?.name || 'User'} size="xl" />
            <div>
              <div className="font-semibold text-[#f1f1f8]">{user?.name}</div>
              <div className="text-sm text-[#8b8ba8]">{user?.email}</div>
            </div>
          </div>
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="form-group">
              <label className="label">Display Name</label>
              <input
                id="settings-name"
                className="input"
                value={profileForm.name}
                onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                placeholder="Your name"
                required
              />
            </div>
            <div className="form-group">
              <label className="label">Email address</label>
              <input className="input opacity-50" value={user?.email || ''} disabled />
              <p className="text-xs text-[#8b8ba8] mt-1">Email cannot be changed</p>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={savingProfile} className="btn-primary">
                {savingProfile ? <><span className="spinner w-4 h-4" />Saving...</> : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* Workspace Settings */}
        {canManageWorkspace && (
          <div className="card mb-6">
            <h2 className="section-title mb-5 pb-4 border-b border-[#2e2e3e]">Workspace</h2>
            <form onSubmit={saveWorkspace} className="space-y-4">
              <div className="form-group">
                <label className="label">Workspace Name</label>
                <input
                  id="settings-workspace-name"
                  className="input"
                  value={workspaceForm.name}
                  onChange={e => setWorkspaceForm({ ...workspaceForm, name: e.target.value })}
                  placeholder="Workspace name"
                  required
                />
              </div>
              <div className="form-group">
                <label className="label">Slug</label>
                <input className="input opacity-50" value={current?.slug || ''} disabled />
                <p className="text-xs text-[#8b8ba8] mt-1">Slug cannot be changed after creation</p>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={savingWorkspace} className="btn-primary">
                  {savingWorkspace ? <><span className="spinner w-4 h-4" />Saving...</> : 'Save Workspace'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Danger Zone */}
        {role === 'Owner' && (
          <div className="card border-red-500/20">
            <h2 className="text-base font-semibold text-red-400 mb-4">Danger Zone</h2>
            <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <div>
                <div className="text-sm font-medium text-[#f1f1f8]">Delete Workspace</div>
                <div className="text-xs text-[#8b8ba8] mt-0.5">Permanently delete this workspace and all its data</div>
              </div>
              <button
                onClick={() => dispatch(addToast({ type: 'warning', title: 'Workspace deletion is not yet implemented in this demo' }))}
                className="btn-danger btn-sm"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
