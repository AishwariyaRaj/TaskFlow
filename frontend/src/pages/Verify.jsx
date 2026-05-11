import React, { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading') // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No verification token found in the URL.')
      return
    }
    api.post('/auth/verify-email', { token })
      .then(() => { setStatus('success') })
      .catch(err => {
        setStatus('error')
        setMessage(err.response?.data?.message || 'Verification failed. The link may be expired.')
      })
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'radial-gradient(ellipse at top, #1a1a2e 0%, #0f0f13 60%)' }}>
      <div className="auth-card text-center animate-scale-in">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="spinner w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-[#f1f1f8] mb-2">Verifying your email...</h2>
            <p className="text-sm text-[#8b8ba8]">Please wait a moment</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#f1f1f8] mb-2">Email verified!</h2>
            <p className="text-sm text-[#8b8ba8] mb-6">Your email has been verified successfully. You can now sign in.</p>
            <Link to="/login" className="btn-primary btn-lg block text-center">
              Go to Login
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#f1f1f8] mb-2">Verification failed</h2>
            <p className="text-sm text-[#8b8ba8] mb-6">{message}</p>
            <div className="space-y-3">
              <Link to="/login" className="btn-secondary btn-lg block text-center">
                Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
