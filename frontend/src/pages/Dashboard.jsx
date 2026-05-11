import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../services/api'
import AppLayout from '../components/layout/AppLayout'
import Avatar, { AvatarGroup } from '../components/ui/Avatar'

function StatCard({ label, value, icon, color, trend }) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${color}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-[#f1f1f8] mb-1">{value}</div>
      <div className="text-sm text-[#8b8ba8]">{label}</div>
    </div>
  )
}

export default function Dashboard() {
  const { workspaceId } = useParams()
  const current = useSelector(s => s.workspace.current)
  const plan = current?.plan || 'FREE'
  const planLabel = plan === 'FREE' ? 'Free' : plan
  const [analytics, setAnalytics] = useState(null)
  const [projects, setProjects] = useState([])
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!workspaceId) return
    setLoading(true)
    ;(async () => {
      try {
        const p = await api.get(`/workspaces/${workspaceId}/projects`)
        setProjects(p.data || [])
        if (plan !== 'FREE') {
          const [a, act] = await Promise.all([
            api.get(`/workspaces/${workspaceId}/analytics`),
            api.get(`/workspaces/${workspaceId}/analytics/activity?limit=8`),
          ])
          setAnalytics(a.data)
          setActivity(act.data || [])
        } else {
          setAnalytics(null)
          setActivity([])
        }
      } catch {
      } finally {
        setLoading(false)
      }
    })()
  }, [workspaceId, plan])

  const actionLabels = {
    'task.created': { label: 'created a task', color: 'bg-indigo-500' },
    'task.updated': { label: 'updated a task', color: 'bg-blue-500' },
    'task.deleted': { label: 'deleted a task', color: 'bg-red-500' },
    'project.created': { label: 'created a project', color: 'bg-emerald-500' },
    'project.deleted': { label: 'deleted a project', color: 'bg-red-500' },
    'user.joined': { label: 'joined workspace', color: 'bg-amber-500' },
    'workspace.created': { label: 'created workspace', color: 'bg-violet-500' },
  }

  return (
    <AppLayout title="Dashboard">
      <div className="max-w-7xl mx-auto">
        {/* Hero */}
        <div className="rounded-3xl p-7 mb-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #1a1a24 50%, #0f0f13 100%)' }}>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #6366f1 0%, transparent 60%), radial-gradient(circle at 80% 20%, #7c3aed 0%, transparent 50%)' }} />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/70 text-xs font-medium mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live workspace
            </div>
            <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {current?.name || 'Workspace'}
            </h2>
            <p className="text-white/60 text-sm">
              {planLabel} plan · {projects.length} project{projects.length !== 1 ? 's' : ''}
            </p>
            {plan === 'FREE' && (
              <div className="mt-4">
                <button onClick={() => navigate(`/workspaces/${workspaceId}/billing`)} className="btn-primary btn-sm">
                  Upgrade to PRO/TEAM
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1,2,3,4].map(i => <div key={i} className="card h-32 shimmer" />)}
          </div>
        ) : plan === 'FREE' ? (
          <div className="card mb-6">
            <div className="text-sm text-[#8b8ba8]">
              Upgrade to PRO to unlock analytics and activity insights.
            </div>
          </div>
        ) : analytics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Total Tasks"
              value={analytics.totalTasks}
              color="bg-indigo-600"
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
            />
            <StatCard
              label="Completed"
              value={analytics.completedTasks}
              color="bg-emerald-600"
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
            />
            <StatCard
              label="Active Users"
              value={analytics.activeUsers}
              color="bg-blue-600"
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
            />
            <StatCard
              label="Completion Rate"
              value={`${analytics.completionRate}%`}
              color="bg-amber-600"
              icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
            />
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Projects */}
          <div className="xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Projects</h2>
              <button onClick={() => navigate(`/workspaces/${workspaceId}/projects`)} className="btn-ghost btn-sm">
                View all →
              </button>
            </div>
            {projects.length === 0 ? (
              <div className="card text-center py-10">
                <div className="text-3xl mb-3">📋</div>
                <p className="text-sm text-[#8b8ba8] mb-4">No projects yet. Create your first one!</p>
                <button onClick={() => navigate(`/workspaces/${workspaceId}/projects`)} className="btn-primary btn-sm">
                  Create Project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {projects.slice(0, 4).map(p => (
                  <div
                    key={p._id}
                    onClick={() => navigate(`/workspaces/${workspaceId}/projects/${p._id}`)}
                    className="card-hover p-4 cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white text-sm font-bold">
                        {p.name[0]}
                      </div>
                      <svg className="w-4 h-4 text-[#8b8ba8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <h4 className="font-medium text-[#f1f1f8] text-sm mb-1 line-clamp-1">{p.name}</h4>
                    <p className="text-xs text-[#8b8ba8] line-clamp-1">{p.description || 'No description'}</p>
                    <div className="mt-3 text-xs text-[#8b8ba8]">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <div>
            <h2 className="section-title mb-4">Recent Activity</h2>
            <div className="card p-0 overflow-hidden">
              {activity.length === 0 ? (
                <div className="p-6 text-center text-sm text-[#8b8ba8]">No recent activity</div>
              ) : (
                <div className="divide-y divide-[#2e2e3e]">
                  {activity.map(item => {
                    const meta = actionLabels[item.action] || { label: item.action, color: 'bg-[#8b8ba8]' }
                    return (
                      <div key={item._id} className="activity-item px-4">
                        <div className={`activity-dot ${meta.color}`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-[#f1f1f8]">
                            <span className="font-medium">{item.user?.name || 'Someone'}</span>
                            {' '}{meta.label}
                            {item.meta?.title && <span className="text-indigo-400"> "{item.meta.title}"</span>}
                          </div>
                          <div className="text-[10px] text-[#8b8ba8] mt-0.5">
                            {new Date(item.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
