import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useTask, useUpdateTask, useDeleteTask } from '@/api/tasks.api'
import { useComments, useAddComment, useDeleteComment } from '@/api/comments.api'
import { useProject } from '@/api/projects.api'
import PriorityBadge from '@/components/shared/PriorityBadge'
import CountdownBadge from '@/components/shared/CountdownBadge'
import { formatDate } from '@/utils/date.utils'
import { suggestPriority } from '@/utils/priority-suggester'
import { Trash2, Send, Save } from 'lucide-react'
import useAuthStore from '@/store/auth.store'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const EMPTY_FORM = { title: '', priority: 'MEDIUM', status: 'TODO', dueDate: '', assigneeId: '', description: '' }

function formFromTask(task) {
  return {
    title: task.title || '',
    priority: task.priority || 'MEDIUM',
    status: task.status || 'TODO',
    dueDate: task.dueDate && new Date(task.dueDate).getFullYear() >= 2020 ? task.dueDate.slice(0, 10) : '',
    assigneeId: task.assigneeId || '',
    description: task.description || '',
  }
}

export default function TaskDetailModal({ taskId, projectId, open, onClose }) {
  const user = useAuthStore(s => s.user)
  const isAdmin = user?.role === 'ADMIN'
  const { data: task } = useTask(taskId)
  const { data: comments = [] } = useComments(taskId)
  const { data: project } = useProject(projectId)
  const projectMembers = project?.members?.map(m => m.user) ?? []
  const { mutate: update, isPending: saving } = useUpdateTask(projectId)
  const { mutate: deleteTask } = useDeleteTask(projectId)
  const { mutate: addComment, isPending: commenting } = useAddComment(taskId)
  const { mutate: deleteComment } = useDeleteComment(taskId)

  const [form, setForm] = useState(EMPTY_FORM)
  const [isDirty, setIsDirty] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [suggestedPriority, setSuggestedPriority] = useState(null)

  // Reset form whenever the modal opens or a different task is loaded
  useEffect(() => {
    if (task && open) {
      setForm(formFromTask(task))
      setIsDirty(false)
      setSuggestedPriority(null)
    }
  }, [task?.id, open])

  if (!task) return null

  const setField = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
    setIsDirty(true)
  }

  const handleTitleChange = (e) => {
    const val = e.target.value
    setField('title', val)
    const sug = suggestPriority(val)
    setSuggestedPriority(sug && sug !== form.priority ? sug : null)
  }

  const handleSave = () => {
    if (!form.title.trim()) { toast.error('Title is required'); return }
    if (form.dueDate) {
      const year = new Date(form.dueDate).getFullYear()
      if (year < 2020 || year > 2099) { toast.error('Due date year must be between 2020 and 2099'); return }
    }
    update(
      {
        id: taskId,
        title: form.title.trim(),
        priority: form.priority,
        status: form.status,
        dueDate: form.dueDate || null,
        assigneeId: form.assigneeId || null,
        description: form.description || null,
      },
      {
        onSuccess: () => {
          setIsDirty(false)
          toast.success('Task saved')
        },
        onError: (err) => {
          toast.error(err?.response?.data?.message || 'Failed to save')
        },
      }
    )
  }

  const submitComment = (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    addComment(commentText, { onSuccess: () => setCommentText('') })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="sr-only">Task Detail</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-2">
          <div className="space-y-5">
            {/* Title */}
            <div>
              {isAdmin ? (
                <input
                  className="w-full text-lg font-semibold text-foreground bg-transparent border-b border-transparent focus:border-primary focus:outline-none pb-1"
                  value={form.title}
                  onChange={handleTitleChange}
                />
              ) : (
                <h2 className="text-lg font-semibold text-foreground">{task.title}</h2>
              )}
              {suggestedPriority && (
                <div className="mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2 text-sm">
                  <span className="text-red-600 dark:text-red-400">⚡ We detected this might be URGENT.</span>
                  <button onClick={() => { setField('priority', 'URGENT'); setSuggestedPriority(null) }}
                    className="text-red-600 dark:text-red-400 font-medium underline text-xs">Set it?</button>
                  <button onClick={() => setSuggestedPriority(null)} className="ml-auto text-muted-foreground text-xs">Dismiss</button>
                </div>
              )}
            </div>

            {/* Fields grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground text-xs block mb-1">Priority</span>
                {isAdmin ? (
                  <select value={form.priority} onChange={e => setField('priority', e.target.value)}
                    className="h-7 text-xs rounded border border-input bg-background px-2 text-foreground">
                    {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                ) : <PriorityBadge priority={task.priority} />}
              </div>
              <div>
                <span className="text-muted-foreground text-xs block mb-1">Status</span>
                <select value={form.status} onChange={e => setField('status', e.target.value)}
                  className="h-7 text-xs rounded border border-input bg-background px-2 text-foreground">
                  {['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'].map(s => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <span className="text-muted-foreground text-xs block mb-1">Due Date</span>
                {task.dueDate && new Date(task.dueDate).getFullYear() >= 2020 && !isDirty ? (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-foreground">{formatDate(task.dueDate)}</span>
                    <CountdownBadge dueDate={task.dueDate} />
                  </div>
                ) : null}
                {isAdmin ? (
                  <input type="date"
                    className="mt-0.5 h-7 text-xs rounded border border-input bg-background px-2 text-foreground w-full"
                    min="2020-01-01" max="2099-12-31"
                    value={form.dueDate}
                    onChange={e => setField('dueDate', e.target.value)}
                  />
                ) : (
                  !task.dueDate ? <span className="text-xs text-muted-foreground">No due date</span> : null
                )}
              </div>
              <div>
                <span className="text-muted-foreground text-xs block mb-1">Assignee</span>
                {isAdmin ? (
                  <select value={form.assigneeId} onChange={e => setField('assigneeId', e.target.value)}
                    className="h-7 text-xs rounded border border-input bg-background px-2 text-foreground w-full">
                    <option value="">Unassigned</option>
                    {projectMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                ) : (
                  <span className="text-xs text-foreground">{task.assignee?.name || 'Unassigned'}</span>
                )}
              </div>
            </div>

            {/* Description */}
            {(isAdmin || task.description) && (
              <div>
                <span className="text-muted-foreground text-xs block mb-1">Description</span>
                {isAdmin ? (
                  <textarea
                    className="w-full text-sm text-foreground bg-muted/40 border border-input rounded-md p-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                    rows={3}
                    value={form.description}
                    onChange={e => setField('description', e.target.value)}
                    placeholder="Add description…"
                  />
                ) : (
                  <p className="text-sm text-foreground">{task.description || '—'}</p>
                )}
              </div>
            )}

            <Separator />

            {/* Comments */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Comments ({comments.length})</h4>
              <div className="space-y-3 mb-4">
                {comments.map(c => (
                  <div key={c.id} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-medium flex-shrink-0">
                      {c.user.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 bg-muted/40 rounded-lg px-3 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-foreground">{c.user.name}</span>
                        <span className="text-xs text-muted-foreground">{format(new Date(c.createdAt), 'MMM d, h:mm a')}</span>
                      </div>
                      <p className="text-sm text-foreground">{c.content}</p>
                    </div>
                    {(c.userId === user?.id || isAdmin) && (
                      <button onClick={() => deleteComment(c.id)} className="text-muted-foreground hover:text-red-500 self-start mt-1">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <form onSubmit={submitComment} className="flex gap-2">
                <Input value={commentText} onChange={e => setCommentText(e.target.value)}
                  placeholder="Write a comment…" className="flex-1 text-sm" />
                <Button type="submit" size="sm" disabled={commenting || !commentText.trim()} className="bg-primary hover:bg-primary/90">
                  <Send size={14} />
                </Button>
              </form>
            </div>
          </div>
        </ScrollArea>

        {/* Footer: Delete (admin) + Save */}
        <div className="pt-3 border-t border-border flex items-center justify-between">
          {isAdmin ? (
            <Button variant="destructive" size="sm" onClick={() => { deleteTask(taskId); onClose() }}>
              <Trash2 size={14} className="mr-1.5" /> Delete Task
            </Button>
          ) : <div />}
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90"
            onClick={handleSave}
            disabled={saving || !isDirty}
          >
            <Save size={14} className="mr-1.5" />
            {saving ? 'Saving…' : isDirty ? 'Save Changes' : 'Saved'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
