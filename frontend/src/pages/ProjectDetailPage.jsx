import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Filter, UserPlus, Archive } from 'lucide-react'
import { useProject, useArchiveProject, useAddMember, useRemoveMember } from '@/api/projects.api'
import { useProjectTasks, useCreateTask } from '@/api/tasks.api'
import { useMembers } from '@/api/members.api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import KanbanBoard from '@/components/kanban/KanbanBoard'
import TaskDetailModal from '@/components/kanban/TaskDetailModal'
import { suggestPriority } from '@/utils/priority-suggester'
import useAuthStore from '@/store/auth.store'
import { Label } from '@/components/ui/label'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const user = useAuthStore(s => s.user)
  const isAdmin = user?.role === 'ADMIN'
  const { data: project, isLoading: loadingProject } = useProject(id)
  const [filters, setFilters] = useState({})
  const { data: tasks, isLoading: loadingTasks } = useProjectTasks(id, filters)
  const { mutate: createTask, isPending: creating } = useCreateTask(id)
  const { mutate: archiveProject } = useArchiveProject()
  const { mutate: addMember, isPending: addingMember } = useAddMember(id)
  const { data: allMembers = [] } = useMembers()
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [taskFormOpen, setTaskFormOpen] = useState(false)
  const [memberFormOpen, setMemberFormOpen] = useState(false)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeId: '' })
  const [selectedUserId, setSelectedUserId] = useState('')
  const [suggestedPriority, setSuggestedPriority] = useState(null)

  const handleTitleInput = (e) => {
    const val = e.target.value
    setTaskForm(f => ({ ...f, title: val }))
    const sug = suggestPriority(val)
    setSuggestedPriority(sug && sug !== taskForm.priority ? sug : null)
  }

  const submitTask = (e) => {
    e.preventDefault()
    const data = { ...taskForm, dueDate: taskForm.dueDate || undefined, assigneeId: taskForm.assigneeId || undefined }
    createTask(data, { onSuccess: () => { setTaskFormOpen(false); setTaskForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assigneeId: '' }); setSuggestedPriority(null) } })
  }

  if (loadingProject) return <div className="flex items-center justify-center h-48"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
  if (!project) return null

  const nonMembers = allMembers.filter(m => !project.members?.some(pm => pm.userId === m.id))

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/projects" className="text-muted-foreground hover:text-foreground"><ArrowLeft size={18} /></Link>
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
        <h2 className="text-xl font-semibold text-foreground">{project.name}</h2>
        <div className="flex items-center gap-2 ml-auto">
          {isAdmin && (
            <>
              <Button variant="outline" size="sm" onClick={() => setMemberFormOpen(true)}>
                <UserPlus size={14} className="mr-1.5" /> Add Member
              </Button>
              <Button variant="outline" size="sm" onClick={() => archiveProject(id)}>
                <Archive size={14} className="mr-1.5" /> Archive
              </Button>
            </>
          )}
          <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => setTaskFormOpen(true)}>
            <Plus size={14} className="mr-1.5" /> New Task
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => (
          <button key={p} onClick={() => setFilters(f => f.priority === p ? {} : { ...f, priority: p })}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${filters.priority === p ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}>
            {p}
          </button>
        ))}
        {filters.priority && <button onClick={() => setFilters({})} className="text-xs px-2.5 py-1 text-muted-foreground hover:text-foreground">Clear</button>}
      </div>

      <KanbanBoard tasks={tasks || []} projectId={id} onTaskClick={(t) => setSelectedTaskId(t.id)} isLoading={loadingTasks} />

      {selectedTaskId && (
        <TaskDetailModal taskId={selectedTaskId} projectId={id} open={!!selectedTaskId} onClose={() => setSelectedTaskId(null)} />
      )}

      <Dialog open={taskFormOpen} onOpenChange={setTaskFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
          <form onSubmit={submitTask} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input placeholder="Task title" value={taskForm.title} onChange={handleTitleInput} required />
              {suggestedPriority && (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded px-2 py-1.5 text-xs">
                  <span className="text-red-600 dark:text-red-400">⚡ Detected as URGENT.</span>
                  <button type="button" onClick={() => { setTaskForm(f => ({ ...f, priority: 'URGENT' })); setSuggestedPriority(null) }}
                    className="text-red-600 underline font-medium">Set it?</button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <select value={taskForm.priority} onChange={e => setTaskForm(f => ({ ...f, priority: e.target.value }))}
                  className="w-full h-9 text-sm rounded-md border border-input bg-background px-3 text-foreground">
                  {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Due Date</Label>
                <Input type="date" value={taskForm.dueDate} onChange={e => setTaskForm(f => ({ ...f, dueDate: e.target.value }))} />
              </div>
            </div>
            {isAdmin && (
              <div className="space-y-1.5">
                <Label>Assign To</Label>
                <select value={taskForm.assigneeId} onChange={e => setTaskForm(f => ({ ...f, assigneeId: e.target.value }))}
                  className="w-full h-9 text-sm rounded-md border border-input bg-background px-3 text-foreground">
                  <option value="">Unassigned</option>
                  {project.members?.map(m => <option key={m.userId} value={m.userId}>{m.user.name}</option>)}
                </select>
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => setTaskFormOpen(false)} className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={creating}>
                {creating ? 'Creating…' : 'Create Task'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={memberFormOpen} onOpenChange={setMemberFormOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Add Member</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}
              className="w-full h-9 text-sm rounded-md border border-input bg-background px-3 text-foreground">
              <option value="">Select a member…</option>
              {nonMembers.map(m => <option key={m.id} value={m.id}>{m.name} ({m.email})</option>)}
            </select>
            <Button className="w-full bg-primary hover:bg-primary/90" disabled={!selectedUserId || addingMember}
              onClick={() => addMember(selectedUserId, { onSuccess: () => { setMemberFormOpen(false); setSelectedUserId('') } })}>
              {addingMember ? 'Adding…' : 'Add to Project'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
