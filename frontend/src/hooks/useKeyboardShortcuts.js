import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export const useKeyboardShortcuts = ({ onNewTask, onToggleShortcuts }) => {
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e) => {
      const tag = e.target.tagName
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      switch (e.key) {
        case 'n': e.preventDefault(); onNewTask?.(); break
        case 'p': e.preventDefault(); navigate('/projects'); break
        case '?': e.preventDefault(); onToggleShortcuts?.(); break
        case 'Escape': break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [navigate, onNewTask, onToggleShortcuts])
}
