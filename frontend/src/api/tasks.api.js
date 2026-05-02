import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from './axios'
import toast from 'react-hot-toast'

export const useProjectTasks = (projectId, filters = {}) =>
  useQuery({
    queryKey: ['tasks', projectId, filters],
    queryFn: () => api.get(`/tasks/project/${projectId}`, { params: filters }).then(r => r.data),
    enabled: !!projectId,
  })

export const useMyTasks = () =>
  useQuery({ queryKey: ['myTasks'], queryFn: () => api.get('/tasks/my').then(r => r.data) })

export const useTask = (id) =>
  useQuery({ queryKey: ['task', id], queryFn: () => api.get(`/tasks/${id}`).then(r => r.data), enabled: !!id })

export const useCreateTask = (projectId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post(`/tasks/project/${projectId}`, data).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries(['tasks', projectId]); toast.success('Task created') },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })
}

export const useUpdateTask = (projectId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => api.patch(`/tasks/${id}`, data).then(r => r.data),
    onMutate: async ({ id, status }) => {
      if (!status) return
      await qc.cancelQueries(['tasks', projectId])
      const prev = qc.getQueryData(['tasks', projectId])
      qc.setQueryData(['tasks', projectId], old =>
        old?.map(t => t.id === id ? { ...t, status } : t)
      )
      return { prev }
    },
    onError: (_, __, ctx) => { if (ctx?.prev) qc.setQueryData(['tasks', projectId], ctx.prev) },
    onSettled: () => { qc.invalidateQueries(['tasks', projectId]); qc.invalidateQueries(['myTasks']) },
  })
}

export const useDeleteTask = (projectId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/tasks/${id}`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries(['tasks', projectId]); toast.success('Task deleted') },
  })
}
