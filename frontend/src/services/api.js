import axios from 'axios'
import store from '../store'
import { setAccessToken, clearAuth } from '../store/authSlice'

const base = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

const api = axios.create({
  baseURL: base,
  withCredentials: true,
  timeout: 15000,
})

// Attach access token to requests
api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config
    if (err.response && err.response.status === 401 && !originalRequest._retry) {
      // Don't retry refresh endpoint itself
      if (originalRequest.url?.includes('/auth/refresh')) {
        store.dispatch(clearAuth())
        return Promise.reject(err)
      }

      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token
          return api(originalRequest)
        }).catch(e => Promise.reject(e))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const r = await axios.post(`${base}/auth/refresh`, {}, { withCredentials: true })
        const newToken = r.data.accessToken
        store.dispatch(setAccessToken(newToken))
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        store.dispatch(clearAuth())
        window.location.href = '/login'
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(err)
  }
)

export default api
