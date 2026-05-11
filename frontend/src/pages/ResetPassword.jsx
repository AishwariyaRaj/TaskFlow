import React, { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

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
      await api.post('/auth/reset-password', { token, password: form.password })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Try requesting a new link.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'radial-gradient(ellipse at top, #1a1a2e 0%, #0f0f13 60%)' }}>
      <div className="auth-card animate-scale-in">
        {success ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#f1f1f8] mb-2">Password reset!</h2>
            <p className="text-sm text-[#8b8ba8] mb-6">Your password has been changed. Please sign in with your new password.</p>
            <Link to="/login" className="btn-primary btn-lg block text-center">Go to Login</Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-[#f1f1f8] mb-1">Set new password</h1>
            <p className="text-sm text-[#8b8ba8] mb-6">Choose a strong password for your account.</p>

            {!token && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-5">
                Invalid reset link. Please request a new one.
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-5">
                {error}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="form-group">
                <label className="label">New password</label>
                <input
                  id="reset-password"
                  className="input input-lg"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  disabled={!token}
                />
              </div>
              <div className="form-group">
                <label className="label">Confirm password</label>
                <input
                  id="reset-confirm-password"
                  className="input input-lg"
                  type="password"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                  disabled={!token}
                />
              </div>
              <button
                id="reset-submit"
                type="submit"
                disabled={loading || !token}
                className="btn-primary btn-lg w-full"
              >
                {loading ? <><span className="spinner w-4 h-4" />Resetting...</> : 'Reset password'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <Link to="/login" className="text-sm text-[#8b8ba8] hover:text-indigo-400 transition-colors">
                ← Back to login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
