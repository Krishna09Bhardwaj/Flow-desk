import { useQuery } from '@tanstack/react-query'
import api from './axios'

export const useMembers = () =>
  useQuery({ queryKey: ['members'], queryFn: () => api.get('/members').then(r => r.data) })
