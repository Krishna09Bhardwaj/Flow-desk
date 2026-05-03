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

export const useStandupTasks = (isAdmin) =>
  useQuery({
    queryKey: ['standupTasks', isAdmin],
    queryFn: () => api.get(isAdmin ? '/tasks/my?admin=true' : '/tasks/my').then(r => r.data),
  })

export const useTask = (id) =>
  useQuery({ queryKey: ['task', id], queryFn: () => api.get(`/tasks/${id}`).then(r => r.data), enabled: !!id })

export const useCreateTask = (projectId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post(`/tasks/project/${projectId}`, data).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks', projectId] }); toast.success('Task created') },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })
}

export const useUpdateTask = (projectId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => api.patch(`/tasks/${id}`, data).then(r => r.data),
    onMutate: async ({ id, status }) => {
      if (!status) return
      await qc.cancelQueries({ queryKey: ['tasks', projectId] })
      // getQueriesData returns [[key, data], ...] — works for prefix matching unlike getQueryData
      const prev = qc.getQueriesData({ queryKey: ['tasks', projectId] })
      qc.setQueriesData({ queryKey: ['tasks', projectId] }, (old) =>
        Array.isArray(old) ? old.map(t => t.id === id ? { ...t, status } : t) : old
      )
      return { prev }
    },
    onError: (_, __, ctx) => {
      ctx?.prev?.forEach(([key, data]) => qc.setQueryData(key, data))
    },
    onSettled: (_, __, variables) => {
      qc.invalidateQueries({ queryKey: ['tasks', projectId] })
      qc.invalidateQueries({ queryKey: ['myTasks'] })
      if (variables?.id) qc.invalidateQueries({ queryKey: ['task', variables.id] })
    },
  })
}

export const useSendReminder = () =>
  useMutation({
    mutationFn: (taskId) => api.post(`/tasks/${taskId}/remind`).then(r => r.data),
    onSuccess: () => toast.success('Reminder sent to assignee'),
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to send reminder'),
  })

export const useDeleteTask = (projectId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/tasks/${id}`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks', projectId] }); toast.success('Task deleted') },
  })
}
