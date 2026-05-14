import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { GoogleLogin } from '@react-oauth/google'
import { useDispatch } from 'react-redux'
import { setAuth } from '../store/authSlice'
import { connectSocket } from '../services/socket'
import ToastContainer from '../components/ui/Toast'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/register', { name: form.name, email: form.email, password: form.password })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
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
      navigate('/workspaces')
    } catch (err) {
      setError(err.response?.data?.message || 'Google signup failed')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'radial-gradient(ellipse at top, #1a1a2e 0%, #0f0f13 60%)' }}>
        <div className="auth-card text-center animate-scale-in">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#f1f1f8] mb-2">Check your email!</h2>
          <p className="text-sm text-[#8b8ba8] mb-6">
            We've sent a verification link to <strong className="text-[#f1f1f8]">{form.email}</strong>. 
            Click the link to activate your account.
          </p>
          <Link to="/login" className="btn-primary btn-lg block text-center">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'radial-gradient(ellipse at top, #1a1a2e 0%, #0f0f13 60%)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-8" style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
      </div>

      <div className="auth-card animate-scale-in">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-glow">
            T
          </div>
          <div>
            <div className="text-xl font-bold text-[#f1f1f8]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>TaskFlow</div>
            <div className="text-xs text-[#8b8ba8]">Smart Team Management</div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[#f1f1f8] mb-1">Create your account</h1>
        <p className="text-sm text-[#8b8ba8] mb-6">Get started for free. No credit card required.</p>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-5">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="form-group">
            <label className="label">Full name</label>
            <input
              id="register-name"
              className="input input-lg"
              placeholder="Jane Smith"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="label">Email address</label>
            <input
              id="register-email"
              className="input input-lg"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input
              id="register-password"
              className="input input-lg"
              type="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="label">Confirm password</label>
            <input
              id="register-confirm-password"
              className="input input-lg"
              type="password"
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
          </div>

          <button
            id="register-submit"
            type="submit"
            disabled={loading}
            className="btn-primary btn-lg w-full mt-2"
          >
            {loading ? (
              <><span className="spinner w-4 h-4" />Creating account...</>
            ) : (
              'Create account'
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
            onError={() => setError('Google signup failed')}
            theme="filled_black"
            shape="rectangular"
            size="large"
            width="320"
          />
        </div>

        <p className="text-center text-xs text-[#8b8ba8] mt-4">
          By creating an account you agree to our{' '}
          <span className="text-indigo-400 cursor-pointer hover:underline">Terms</span> and{' '}
          <span className="text-indigo-400 cursor-pointer hover:underline">Privacy Policy</span>
        </p>

        <div className="mt-6 text-center">
          <span className="text-sm text-[#8b8ba8]">Already have an account? </span>
          <Link to="/login" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">
            Sign in
          </Link>
        </div>
      </div>

      <ToastContainer />
    </div>
  )
}
