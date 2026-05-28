import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from './axios'
import toast from 'react-hot-toast'

export const useProjects = () =>
  useQuery({ queryKey: ['projects'], queryFn: () => api.get('/projects').then(r => r.data) })

export const useProject = (id) =>
  useQuery({ queryKey: ['project', id], queryFn: () => api.get(`/projects/${id}`).then(r => r.data), enabled: !!id })

export const useCreateProject = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post('/projects', data).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); toast.success('Project created') },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })
}

export const useUpdateProject = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => api.patch(`/projects/${id}`, data).then(r => r.data),
    onSuccess: (_, { id }) => { qc.invalidateQueries({ queryKey: ['projects'] }); qc.invalidateQueries({ queryKey: ['project', id] }); toast.success('Project updated') },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })
}

export const useArchiveProject = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.patch(`/projects/${id}/archive`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); toast.success('Project archived') },
  })
}

export const useDeleteProject = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/projects/${id}`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); toast.success('Project deleted') },
  })
}

export const useAddMember = (projectId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId) => api.post(`/projects/${projectId}/members`, { userId }).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['project', projectId] }); toast.success('Member added') },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  })
}

export const useRemoveMember = (projectId) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId) => api.delete(`/projects/${projectId}/members/${userId}`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['project', projectId] }); toast.success('Member removed') },
  })
}
