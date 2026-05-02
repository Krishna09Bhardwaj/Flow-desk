import { useQuery } from '@tanstack/react-query'
import api from './axios'

export const useAdminDashboard = () =>
  useQuery({ queryKey: ['adminDashboard'], queryFn: () => api.get('/dashboard/admin').then(r => r.data) })

export const useMemberDashboard = () =>
  useQuery({ queryKey: ['memberDashboard'], queryFn: () => api.get('/dashboard/member').then(r => r.data) })
