import { useEffect, useState } from 'react'
import axios from 'axios'
import useAuthStore from '@/store/auth.store'

// Must match axios.js — uses VITE_API_URL so production calls hit the backend, not the frontend server.
const BASE = import.meta.env.VITE_API_URL || '/api'

export const useAuthInit = () => {
  const [loading, setLoading] = useState(true)
  const { setAuth, user } = useAuthStore()

  useEffect(() => {
    // Skip the auth refresh on guest pages (login, signup) to avoid unnecessary 401 console errors
    const path = window.location.pathname
    const isGuestRoute = path === '/login' || path === '/signup'

    if (user || isGuestRoute) { setLoading(false); return }

    axios.post(`${BASE}/auth/refresh`, {}, { withCredentials: true })
      .then(({ data }) => {
        axios.get(`${BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${data.accessToken}` },
          withCredentials: true,
        })
          .then(({ data: me }) => setAuth(me.user, data.accessToken))
          .catch(() => {})
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { loading }
}
