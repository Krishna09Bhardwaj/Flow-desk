import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateProject, useUpdateProject } from '@/api/projects.api'

const COLORS = ['#7C3AED', '#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED', '#0891B2']

export default function ProjectForm({ open, onClose, project }) {
  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
    color: project?.color || '#7C3AED',
  })
  const { mutate: create, isPending: creating } = useCreateProject()
  const { mutate: update, isPending: updating } = useUpdateProject()
  const isPending = creating || updating

  const submit = (e) => {
    e.preventDefault()
    if (project) {
      update({ id: project.id, ...form }, { onSuccess: onClose })
    } else {
      create(form, { onSuccess: onClose })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{project ? 'Edit Project' : 'New Project'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Project Name</Label>
            <Input placeholder="e.g. Marketing Website" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input placeholder="Optional description" value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                  className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                  style={{ backgroundColor: c, outline: form.color === c ? `2px solid ${c}` : 'none', outlineOffset: '2px' }} />
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={isPending}>
              {isPending ? 'Saving…' : project ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
