import axios from 'axios'
import useAuthStore from '@/store/auth.store'

const baseURL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({ baseURL, withCredentials: true })

// Separate client for the refresh call — no interceptors to avoid infinite loops,
// and uses the same baseURL so it works in both dev (Vite proxy) and production.
const refreshClient = axios.create({ baseURL, withCredentials: true })

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshing = false
let queue = []

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      if (refreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject })
        }).then(() => api(original))
      }
      original._retry = true
      refreshing = true
      try {
        const { data } = await refreshClient.post('/auth/refresh', {}, { withCredentials: true })
        useAuthStore.getState().setAuth(useAuthStore.getState().user, data.accessToken)
        queue.forEach(({ resolve }) => resolve())
        queue = []
        return api(original)
      } catch (refreshErr) {
        // Only force-logout when the refresh token is genuinely invalid (401).
        // Network errors, 502, 503 mean the server is temporarily down — keep the user logged in.
        const status = refreshErr?.response?.status
        if (status === 401) {
          queue.forEach(({ reject }) => reject(refreshErr))
          queue = []
          useAuthStore.getState().logout()
          window.location.href = '/login'
        } else {
          queue.forEach(({ reject }) => reject(err))
          queue = []
        }
      } finally {
        refreshing = false
      }
    }
    return Promise.reject(err)
  }
)

export default api
