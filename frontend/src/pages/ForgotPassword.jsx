import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'radial-gradient(ellipse at top, #1a1a2e 0%, #0f0f13 60%)' }}>
      <div className="auth-card animate-scale-in">
        <Link to="/login" className="flex items-center gap-2 text-[#8b8ba8] hover:text-[#f1f1f8] text-sm mb-6 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to login
        </Link>

        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#f1f1f8] mb-2">Check your email</h2>
            <p className="text-sm text-[#8b8ba8]">
              If an account exists for <strong className="text-[#f1f1f8]">{email}</strong>, 
              you'll receive a password reset link shortly.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-[#f1f1f8] mb-1">Reset password</h1>
            <p className="text-sm text-[#8b8ba8] mb-6">
              Enter your email and we'll send you a reset link.
            </p>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-5">
                {error}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="form-group">
                <label className="label">Email address</label>
                <input
                  id="forgot-email"
                  className="input input-lg"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <button
                id="forgot-submit"
                type="submit"
                disabled={loading}
                className="btn-primary btn-lg w-full"
              >
                {loading ? <><span className="spinner w-4 h-4" />Sending...</> : 'Send reset link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
