import { useEffect, useState } from 'react'
import axios from 'axios'
import useAuthStore from '@/store/auth.store'

export const useAuthInit = () => {
  const [loading, setLoading] = useState(true)
  const { setAuth, user } = useAuthStore()

  useEffect(() => {
    if (user) { setLoading(false); return }
    axios.post('/api/auth/refresh', {}, { withCredentials: true })
      .then(({ data }) => {
        axios.get('/api/auth/me', { headers: { Authorization: `Bearer ${data.accessToken}` }, withCredentials: true })
          .then(({ data: me }) => setAuth(me.user, data.accessToken))
          .catch(() => {})
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { loading }
}
