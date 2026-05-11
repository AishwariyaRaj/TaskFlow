import React, { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../services/api'
import AppLayout from '../components/layout/AppLayout'

function StatCard({ label, value, color, icon }) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-[#f1f1f8] mb-1">{value}</div>
      <div className="text-sm text-[#8b8ba8]">{label}</div>
    </div>
  )
}

function PieChart({ data }) {
  const total = useMemo(() => data.reduce((acc, curr) => acc + curr.value, 0), [data])
  
  const gradientStops = useMemo(() => {
    let currentDegree = 0;
    return data.map(item => {
      const percentage = (item.value / total) * 360;
      const stop = `${item.color} ${currentDegree}deg ${currentDegree + percentage}deg`;
      currentDegree += percentage;
      return stop;
    }).join(', ');
  }, [data, total]);

  if (total === 0) {
    return <div className="text-sm text-[#8b8ba8] py-8 text-center">No tasks to display</div>
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
      <div 
        className="w-40 h-40 rounded-full shadow-lg border-[6px] border-[#13131a] relative"
        style={{ background: `conic-gradient(${gradientStops})` }}
      >
        <div className="absolute inset-0 m-auto w-24 h-24 bg-[#13131a] rounded-full flex items-center justify-center shadow-inner">
          <div className="text-center">
            <div className="text-xl font-bold text-white">{total}</div>
            <div className="text-[10px] text-[#8b8ba8]">Tasks</div>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {data.map(item => (
          <div key={item.name} className="flex items-center gap-3 text-sm text-[#f1f1f8]">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="w-20 font-medium">{item.name}</span>
            <span className="font-bold w-6">{item.value}</span>
            <span className="text-[#8b8ba8] text-xs">({Math.round((item.value / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const actionColors = {
  'task.created': 'bg-indigo-500',
  'task.updated': 'bg-blue-500',
  'task.deleted': 'bg-red-500',
  'project.created': 'bg-emerald-500',
  'project.deleted': 'bg-red-500',
  'user.joined': 'bg-amber-500',
  'workspace.created': 'bg-violet-500',
}

export default function AnalyticsDashboard() {
  const { workspaceId } = useParams()
  const current = useSelector(s => s.workspace.current)
  const plan = current?.plan || 'FREE'
  const [analytics, setAnalytics] = useState(null)
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!workspaceId || plan === 'FREE') return
    setLoading(true)
    Promise.all([
      api.get(`/workspaces/${workspaceId}/analytics`),
      api.get(`/workspaces/${workspaceId}/analytics/activity?limit=20`),
    ]).then(([a, act]) => {
      setAnalytics(a.data)
      setActivity(act.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [workspaceId, plan])

  const handleExport = async (format) => {
    try {
      const response = await api.get(`/workspaces/${workspaceId}/analytics/export?format=${format}`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `workspace-export.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      alert('Failed to export. Team plan required.')
    }
  }

  if (plan === 'FREE') {
    return (
      <AppLayout title="Analytics">
        <div className="max-w-4xl mx-auto">
          <div className="card">
            <div className="text-lg font-semibold text-[#f1f1f8] mb-1">Analytics is a PRO feature</div>
            <div className="text-sm text-[#8b8ba8]">Upgrade this workspace to PRO or TEAM to unlock analytics.</div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Analytics">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="rounded-3xl p-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #1a1a24 60%, #0f0f13 100%)' }}>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #6366f1, transparent 60%)' }} />
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="page-title text-white">Analytics</h1>
              <p className="text-white/60 text-sm mt-1">Track your team's performance and productivity trends</p>
            </div>
            {plan === 'TEAM' && (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleExport('csv')}
                  className="px-4 py-2 bg-indigo-600/20 text-indigo-400 rounded-xl text-sm font-semibold hover:bg-indigo-600/30 transition-all border border-indigo-500/20 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Export CSV
                </button>
                <button 
                  onClick={() => handleExport('pdf')}
                  className="px-4 py-2 bg-red-600/20 text-red-400 rounded-xl text-sm font-semibold hover:bg-red-600/30 transition-all border border-red-500/20 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Export PDF
                </button>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[1,2,3,4].map(i => <div key={i} className="card h-32 shimmer" />)}
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="card h-64 shimmer" />
              <div className="card h-64 shimmer" />
            </div>
          </>
        ) : analytics && (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                label="Total Tasks"
                value={analytics.totalTasks}
                color="bg-indigo-600"
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
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
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
              />
              <StatCard
                label="Completion Rate"
                value={`${analytics.completionRate}%`}
                color="bg-amber-600"
                icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
              {/* Task Distribution */}
              <div className="card">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="section-title">Task Distribution</h3>
                    <p className="text-xs text-[#8b8ba8] mt-0.5">Current tasks by status</p>
                  </div>
                </div>
                {analytics.taskDistribution ? (
                  <PieChart data={analytics.taskDistribution} />
                ) : (
                  <div className="text-sm text-[#8b8ba8] py-8 text-center">No data available</div>
                )}
              </div>

              {/* Activity Log */}
              <div className="card overflow-hidden">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="section-title">Activity Log</h3>
                  <span className="text-xs text-[#8b8ba8]">{activity.length} events</span>
                </div>
                <div className="space-y-0 -mx-5 max-h-[400px] overflow-y-auto">
                  {activity.length === 0 ? (
                    <div className="text-sm text-[#8b8ba8] py-8 text-center">No activity recorded</div>
                  ) : activity.map(item => (
                    <div key={item._id} className="flex items-start gap-3 px-5 py-3 border-b border-[#2e2e3e] last:border-0 hover:bg-white/5 transition-colors">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${actionColors[item.action] || 'bg-[#8b8ba8]'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-[#f1f1f8]">
                          <span className="font-medium">{item.user?.name || 'Unknown'}</span>
                          {' — '}{item.action.replace('.', ' ')}
                          {item.meta?.title && <span className="text-indigo-400"> "{item.meta.title}"</span>}
                        </div>
                        <div className="text-[10px] text-[#8b8ba8] mt-0.5">{new Date(item.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}
