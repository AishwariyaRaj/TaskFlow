import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setAuth } from '../store/authSlice'
import { connectSocket } from '../services/socket'
import api from '../services/api'
import { GoogleLogin } from '@react-oauth/google'
import ToastContainer from '../components/ui/Toast'
import { addToast } from '../store/uiSlice'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/workspaces'

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const r = await api.post('/auth/login', form)
      console.log('[LOGIN] Got token:', r.data.accessToken ? 'YES' : 'NO')
      console.log('[LOGIN] Saving to localStorage...')
      localStorage.setItem('auth', JSON.stringify({ 
        accessToken: r.data.accessToken, 
        user: r.data.user 
      }))
      console.log('[LOGIN] Saved to localStorage:', localStorage.getItem('auth') ? 'YES' : 'NO')
      
      dispatch(setAuth({ accessToken: r.data.accessToken, user: r.data.user }))
      console.log('[LOGIN] Dispatched setAuth')
      try { connectSocket(r.data.accessToken) } catch {}
      console.log('[LOGIN] Redirecting to:', redirectTo)
      navigate(redirectTo)
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function onGoogleSuccess(response) {
    setError('')
    setLoading(true)
    try {
      const r = await api.post('/auth/google-login', { credential: response.credential })
      localStorage.setItem('auth', JSON.stringify({ accessToken: r.data.accessToken, user: r.data.user }))
      dispatch(setAuth({ accessToken: r.data.accessToken, user: r.data.user }))
      try { connectSocket(r.data.accessToken) } catch {}
      navigate(redirectTo)
    } catch (err) {
      setError(err.response?.data?.message || 'Google login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'radial-gradient(ellipse at top, #1a1a2e 0%, #0f0f13 60%)' }}>
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
      </div>

      <div className="auth-card animate-scale-in relative">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-glow">
            T
          </div>
          <div>
            <div className="text-xl font-bold text-[#f1f1f8]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>TaskFlow</div>
            <div className="text-xs text-[#8b8ba8]">Smart Team Management</div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[#f1f1f8] mb-1">Welcome back</h1>
        <p className="text-sm text-[#8b8ba8] mb-6">Sign in to your workspace</p>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-5 animate-slide-up">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="form-group">
            <label className="label">Email address</label>
            <input
              id="login-email"
              className="input input-lg"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <div className="flex items-center justify-between mb-1.5">
              <label className="label mb-0">Password</label>
              <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                Forgot password?
              </Link>
            </div>
            <input
              id="login-password"
              className="input input-lg"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="btn-primary btn-lg w-full mt-2"
          >
            {loading ? (
              <>
                <span className="spinner w-4 h-4" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#2e2e3e]"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#1a1a24] px-2 text-[#8b8ba8]">Or continue with</span>
          </div>
        </div>

        <div className="w-full">
          <GoogleLogin 
            onSuccess={onGoogleSuccess} 
            onError={() => setError('Google login failed')}
            theme="filled_black"
            shape="rectangular"
            size="large"
            width="100%"
          />
        </div>

        <div className="mt-6 text-center">
          <span className="text-sm text-[#8b8ba8]">Don't have an account? </span>
          <Link to="/register" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Create one free
          </Link>
        </div>
      </div>

      <ToastContainer />
    </div>
  )
}
