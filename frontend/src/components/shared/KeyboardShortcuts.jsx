import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const SHORTCUTS = [
  { key: 'N', desc: 'New task (on project page)' },
  { key: 'P', desc: 'Go to Projects' },
  { key: '?', desc: 'Show this help' },
  { key: 'Esc', desc: 'Close modal' },
]

export default function KeyboardShortcuts() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      const tag = e.target.tagName
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return
      if (e.key === '?') { e.preventDefault(); setOpen(o => !o) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader><DialogTitle>⌨️ Keyboard Shortcuts</DialogTitle></DialogHeader>
        <div className="space-y-2">
          {SHORTCUTS.map(s => (
            <div key={s.key} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.desc}</span>
              <kbd className="text-xs bg-muted border border-border rounded px-2 py-0.5 font-mono text-foreground">{s.key}</kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
