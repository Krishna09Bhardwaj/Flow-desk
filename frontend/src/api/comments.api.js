import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from './axios'
import toast from 'react-hot-toast'

export const useComments = (taskId) =>
  useQuery({ queryKey: ['comments', taskId], queryFn: () => api.get(`/comments/task/${taskId}`).then(r => r.data), enabled: !!taskId })

export const useAddComment = (taskId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (content) => api.post(`/comments/task/${taskId}`, { content }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', taskId] }),
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })
}

export const useDeleteComment = (taskId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/comments/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', taskId] }),
  })
}
