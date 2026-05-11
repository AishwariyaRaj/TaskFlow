import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../services/api'
import AppLayout from '../components/layout/AppLayout'

export default function AutomationsPage() {
  const { workspaceId } = useParams()
  const currentWorkspace = useSelector(s => s.workspace.current)
  const plan = currentWorkspace?.plan || 'FREE'

  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newRule, setNewRule] = useState({
    name: '',
    trigger: 'task.completed',
    conditions: [],
    actions: [{ type: 'notify_owner', value: '' }]
  })

  useEffect(() => {
    if (plan === 'TEAM') {
      fetchRules()
    }
  }, [workspaceId, plan])

  const fetchRules = async () => {
    try {
      const res = await api.get(`/workspaces/${workspaceId}/automations`)
      setRules(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/workspaces/${workspaceId}/automations`, newRule)
      setShowAdd(false)
      setNewRule({ name: '', trigger: 'task.completed', conditions: [], actions: [{ type: 'notify_owner', value: '' }] })
      fetchRules()
    } catch (err) {
      alert('Failed to create rule')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this rule?')) return
    try {
      await api.delete(`/workspaces/${workspaceId}/automations/${id}`)
      fetchRules()
    } catch (err) {
      alert('Failed to delete')
    }
  }

  if (plan !== 'TEAM') {
    return (
      <AppLayout title="Automations">
        <div className="max-w-4xl mx-auto py-12 px-6">
          <div className="card text-center py-16">
            <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Workflow Automations</h2>
            <p className="text-[#8b8ba8] mb-8 max-w-md mx-auto">
              Automate repetitive tasks, status updates, and notifications. This feature is exclusive to the <strong>TEAM</strong> plan.
            </p>
            <button className="btn-primary">Upgrade to Team</button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Automations">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Automations</h2>
          <button 
            onClick={() => setShowAdd(true)}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Create Rule
          </button>
        </div>

        {showAdd && (
          <div className="card bg-[#1e1e2d] border border-indigo-500/30">
            <h3 className="text-lg font-semibold text-white mb-4">New Automation Rule</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#8b8ba8] uppercase mb-1.5 px-1">Rule Name</label>
                <input 
                  type="text" 
                  className="input" 
                  value={newRule.name}
                  onChange={e => setNewRule({...newRule, name: e.target.value})}
                  placeholder="e.g. Notify on task completion"
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#8b8ba8] uppercase mb-1.5 px-1">When (Trigger)</label>
                  <select 
                    className="input cursor-pointer"
                    value={newRule.trigger}
                    onChange={e => setNewRule({...newRule, trigger: e.target.value})}
                  >
                    <option value="task.completed">Task is completed</option>
                    <option value="task.created">Task is created</option>
                    <option value="project.created">Project is created</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#8b8ba8] uppercase mb-1.5 px-1">Then (Action)</label>
                  <select 
                    className="input cursor-pointer"
                    value={newRule.actions[0].type}
                    onChange={e => setNewRule({...newRule, actions: [{...newRule.actions[0], type: e.target.value}]})}
                  >
                    <option value="notify_owner">Notify Workspace Owner</option>
                    <option value="update_status">Update Status</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-[#8b8ba8] hover:text-white">Cancel</button>
                <button type="submit" className="btn-primary">Save Rule</button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-[#8b8ba8]">Loading rules...</div>
          ) : rules.length === 0 ? (
            <div className="card text-center py-12 text-[#8b8ba8]">
              No automation rules created yet.
            </div>
          ) : rules.map(rule => (
            <div key={rule._id} className="card flex items-center justify-between group">
              <div>
                <div className="font-semibold text-white mb-1 flex items-center gap-2">
                  {rule.name}
                  {!rule.isActive && <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded border border-red-500/20">INACTIVE</span>}
                </div>
                <div className="text-xs text-[#8b8ba8]">
                  Triggers on <span className="text-indigo-400 font-medium">{rule.trigger}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => handleDelete(rule._id)}
                  className="p-2 text-[#8b8ba8] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
