import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import api from '../services/api'
import { addToast } from '../store/uiSlice'
import AppLayout from '../components/layout/AppLayout'

const PLANS = [
  {
    id: 'FREE',
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for small teams getting started',
    features: [
      'Basic task management',
      'Projects & tasks',
      'Real-time updates',
    ],
    limitations: ['No analytics dashboard', 'No file uploads'],
    color: 'from-slate-500 to-slate-600',
    priceKey: null,
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: '$12',
    period: '/workspace/month',
    description: 'For teams that need premium collaboration features',
    features: [
      'Unlimited projects',
      'Real-time collaboration',
      'Task comments',
      'Advanced filters and search',
      'Calendar view',
      'File uploads',
      'Analytics dashboard',
      'Email notifications',
      'Role-based access control',
      'Up to 15 members',
    ],
    limitations: [],
    color: 'from-indigo-600 to-violet-600',
    priceKey: 'PRO',
    featured: true,
  },
  {
    id: 'TEAM',
    name: 'Team',
    price: '$29',
    period: '/workspace/month',
    description: 'For organizations that need advanced governance and scale',
    features: [
      'Everything in Pro',
      'Unlimited members',
      'Custom roles and permissions',
      'Audit logs',
      'Workflow automations',
      'Advanced analytics',
      'Report export (CSV/PDF)',
      'API/Webhook access',
      'Slack/Discord integrations',
      'Priority support',
    ],
    limitations: [],
    color: 'from-violet-600 to-fuchsia-600',
    priceKey: 'TEAM',
  },
]

export default function BillingPage() {
  const { workspaceId } = useParams()
  const dispatch = useDispatch()
  const role = useSelector(s => s.workspace.currentRole)
  const [subscription, setSubscription] = useState(null)
  const [currentPlan, setCurrentPlan] = useState('FREE')
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState('')
  const [portalLoading, setPortalLoading] = useState(false)

  const canManage = role === 'Owner' || role === 'Admin'
  const currentPlanLabel = currentPlan === 'FREE' ? 'Free' : currentPlan

  useEffect(() => {
    if (!workspaceId) return
    
    // Check if returning from Stripe checkout
    const query = new URLSearchParams(window.location.search)
    const sessionId = query.get('session_id')
    
    if (query.get('success') === 'true' && sessionId) {
      setVerifying(true)
      dispatch(addToast({ type: 'success', title: 'Payment received', message: 'Activating your plan...' }))
      ;(async () => {
        try {
          for (let i = 0; i < 8; i += 1) {
            const r = await api.get(`/workspaces/${workspaceId}/billing/subscription`)
            setSubscription(r.data.subscription)
            setCurrentPlan(r.data.plan || 'FREE')
            if (r.data.plan && r.data.plan !== 'FREE') break
            await new Promise(resolve => setTimeout(resolve, 800))
          }
        } catch {
        } finally {
          window.history.replaceState({}, '', `/workspaces/${workspaceId}/billing`)
          setVerifying(false)
          setLoading(false)
        }
      })()
    } else {
      // Normal load
      api.get(`/workspaces/${workspaceId}/billing/subscription`)
        .then(r => {
          console.log('[BILLING] Loaded plan:', r.data.plan)
          setSubscription(r.data.subscription)
          setCurrentPlan(r.data.plan || 'FREE')
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [workspaceId, dispatch])

  async function handleSubscribe(plan) {
    if (!canManage) {
      dispatch(addToast({ type: 'error', title: 'Only Owners and Admins can manage billing' }))
      return
    }
    setCheckoutLoading(plan.id)
    try {
      const r = await api.post(`/workspaces/${workspaceId}/billing/checkout`, { plan: plan.priceKey })
      if (r.data.url) {
        window.location.href = r.data.url
      } else {
        dispatch(addToast({ type: 'error', title: 'No checkout URL returned' }))
      }
    } catch (err) {
      dispatch(addToast({
        type: 'error',
        title: 'Checkout failed',
        message: err.response?.data?.message || 'Stripe may not be configured. Add Stripe test keys + webhook secret to backend .env'
      }))
    } finally {
      setCheckoutLoading('')
    }
  }

  async function handlePortal() {
    setPortalLoading(true)
    try {
      const r = await api.post(`/workspaces/${workspaceId}/billing/portal`)
      if (r.data.url) window.location.href = r.data.url
    } catch (err) {
      dispatch(addToast({ type: 'error', title: 'Portal error', message: err.response?.data?.message }))
    } finally {
      setPortalLoading(false)
    }
  }

  return (
    <AppLayout title="Billing">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="page-title">Billing & Plans</h1>
          <p className="page-subtitle">Manage your subscription and upgrade for more features</p>
        </div>

        {/* Current Plan */}
        {loading || verifying ? (
          <div className="card h-24 shimmer mb-8 flex items-center justify-center text-[#8b8ba8]">
            {verifying ? <><span className="spinner w-5 h-5 mr-2" /> Verifying payment...</> : ''}
          </div>
        ) : (
          <div className="card mb-8 flex items-center justify-between">
            <div>
              <div className="text-sm text-[#8b8ba8] mb-1">Current plan</div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-[#f1f1f8]">{currentPlanLabel}</span>
                {subscription && (
                  <span className={`badge ${subscription.status === 'active' ? 'badge-done' : 'badge-todo'}`}>
                    {subscription.status}
                  </span>
                )}
              </div>
              {subscription?.currentPeriodEnd && (
                <div className="text-xs text-[#8b8ba8] mt-1">
                  Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </div>
              )}
            </div>
            {currentPlan !== 'FREE' && canManage && (
              <button onClick={handlePortal} disabled={portalLoading} className="btn-secondary">
                {portalLoading ? <><span className="spinner w-4 h-4" />Loading...</> : 'Manage Subscription'}
              </button>
            )}
          </div>
        )}

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map(plan => {
            const isCurrent = currentPlan === plan.id
            return (
              <div
                key={plan.id}
                className={`plan-card ${plan.featured ? 'featured' : ''} ${isCurrent ? 'border-indigo-500/60' : ''}`}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="badge bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-0 px-3">
                      Most Popular
                    </span>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 right-4">
                    <span className="badge badge-done">Current</span>
                  </div>
                )}

                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-white text-lg font-bold mb-4`}>
                  {plan.name[0]}
                </div>

                <h3 className="text-xl font-bold text-[#f1f1f8] mb-1">{plan.name}</h3>
                <p className="text-sm text-[#8b8ba8] mb-4">{plan.description}</p>

                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-3xl font-bold text-[#f1f1f8]">{plan.price}</span>
                  <span className="text-sm text-[#8b8ba8]">{plan.period}</span>
                </div>

                <ul className="space-y-2.5 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-[#8b8ba8]">
                      <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                  {plan.limitations.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-[#8b8ba8]/50">
                      <svg className="w-4 h-4 text-[#8b8ba8]/30 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button disabled className="btn-secondary w-full opacity-50 cursor-not-allowed">
                    Current Plan
                  </button>
                ) : plan.priceKey === null ? (
                  <button disabled className="btn-ghost w-full">Free Plan</button>
                ) : canManage ? (
                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={!!checkoutLoading}
                    className={`w-full ${plan.featured ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {checkoutLoading === plan.id ? <><span className="spinner w-4 h-4" />Redirecting...</> : `Upgrade to ${plan.name}`}
                  </button>
                ) : (
                  <button disabled className="btn-secondary w-full opacity-50 cursor-not-allowed">
                    Owner/Admin only
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-6 p-4 rounded-xl bg-[#22222e] border border-[#2e2e3e] text-xs text-[#8b8ba8]">
          <strong className="text-[#f1f1f8]">Note:</strong> Stripe integration requires{' '}
          <code className="text-indigo-400">STRIPE_SECRET</code>,{' '}
          <code className="text-indigo-400">STRIPE_PRICE_PRO</code>, and{' '}
          <code className="text-indigo-400">STRIPE_PRICE_TEAM</code> to be set in your backend .env file.
        </div>
      </div>
    </AppLayout>
  )
}
