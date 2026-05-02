import { useMutation } from '@tanstack/react-query'
import api from './axios'
import useAuthStore from '@/store/auth.store'
import toast from 'react-hot-toast'

export const useLogin = () => {
  const setAuth = useAuthStore(s => s.setAuth)
  return useMutation({
    mutationFn: (data) => api.post('/auth/login', data).then(r => r.data),
    onSuccess: ({ user, accessToken }) => { setAuth(user, accessToken); toast.success(`Welcome back, ${user.name}!`) },
    onError: (err) => toast.error(err.response?.data?.message || 'Login failed'),
  })
}

export const useSignup = () => {
  const setAuth = useAuthStore(s => s.setAuth)
  return useMutation({
    mutationFn: (data) => api.post('/auth/signup', data).then(r => r.data),
    onSuccess: ({ user, accessToken }) => { setAuth(user, accessToken); toast.success('Account created!') },
    onError: (err) => toast.error(err.response?.data?.message || 'Signup failed'),
  })
}

export const useLogout = () => {
  const logout = useAuthStore(s => s.logout)
  return useMutation({
    mutationFn: () => api.post('/auth/logout').then(r => r.data),
    onSettled: () => { logout(); window.location.href = '/login' },
  })
}
