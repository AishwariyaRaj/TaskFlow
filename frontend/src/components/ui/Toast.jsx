import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { removeToast } from '../../store/uiSlice'

const icons = {
  success: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
}

function ToastItem({ toast }) {
  const dispatch = useDispatch()

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(removeToast(toast.id))
    }, toast.duration || 4000)
    return () => clearTimeout(timer)
  }, [toast.id, dispatch])

  const typeClass = `toast-${toast.type || 'info'}`

  return (
    <div className={typeClass}>
      <div className="flex-shrink-0">{icons[toast.type] || icons.info}</div>
      <div className="flex-1 min-w-0">
        {toast.title && <div className="font-medium text-sm">{toast.title}</div>}
        {toast.message && <div className="text-xs opacity-80 mt-0.5">{toast.message}</div>}
      </div>
      <button
        onClick={() => dispatch(removeToast(toast.id))}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export default function ToastContainer() {
  const toasts = useSelector(s => s.ui.toasts)

  if (!toasts.length) return null

  return (
    <div className="toast">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  )
}
