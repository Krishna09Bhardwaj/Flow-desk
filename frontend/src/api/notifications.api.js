import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from './axios'

export const useNotifications = () =>
  useQuery({ queryKey: ['notifications'], queryFn: () => api.get('/notifications').then(r => r.data), refetchInterval: 30000 })

export const useMarkOneRead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.patch(`/notifications/${id}/read`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export const useMarkAllRead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.patch('/notifications/read-all').then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}
