import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useTask, useUpdateTask, useDeleteTask } from '@/api/tasks.api'
import { useComments, useAddComment, useDeleteComment } from '@/api/comments.api'
import { useMembers } from '@/api/members.api'
import PriorityBadge from '@/components/shared/PriorityBadge'
import CountdownBadge from '@/components/shared/CountdownBadge'
import { formatDate } from '@/utils/date.utils'
import { suggestPriority } from '@/utils/priority-suggester'
import { Trash2, Send } from 'lucide-react'
import useAuthStore from '@/store/auth.store'
import { format } from 'date-fns'

export default function TaskDetailModal({ taskId, projectId, open, onClose }) {
  const user = useAuthStore(s => s.user)
  const isAdmin = user?.role === 'ADMIN'
  const { data: task } = useTask(taskId)
  const { data: comments = [] } = useComments(taskId)
  const { data: members = [] } = useMembers()
  const { mutate: update } = useUpdateTask(projectId)
  const { mutate: deleteTask } = useDeleteTask(projectId)
  const { mutate: addComment, isPending: commenting } = useAddComment(taskId)
  const { mutate: deleteComment } = useDeleteComment(taskId)
  const [commentText, setCommentText] = useState('')
  const [editing, setEditing] = useState({})
  const [suggestedPriority, setSuggestedPriority] = useState(null)

  if (!task) return null

  const handleTitleChange = (e) => {
    const val = e.target.value
    setEditing(ed => ({ ...ed, title: val }))
    const sug = suggestPriority(val)
    setSuggestedPriority(sug && sug !== task.priority ? sug : null)
  }

  const saveField = (field, value) => {
    update({ id: taskId, [field]: value })
    setEditing(ed => { const n = { ...ed }; delete n[field]; return n })
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
            <div>
              {isAdmin ? (
                <input
                  className="w-full text-lg font-semibold text-foreground bg-transparent border-b border-transparent focus:border-primary focus:outline-none pb-1"
                  defaultValue={task.title}
                  onChange={handleTitleChange}
                  onBlur={(e) => editing.title !== undefined && saveField('title', e.target.value)}
                />
              ) : (
                <h2 className="text-lg font-semibold text-foreground">{task.title}</h2>
              )}
              {suggestedPriority && (
                <div className="mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2 text-sm">
                  <span className="text-red-600 dark:text-red-400">⚡ We detected this might be URGENT.</span>
                  <button onClick={() => { saveField('priority', 'URGENT'); setSuggestedPriority(null) }}
                    className="text-red-600 dark:text-red-400 font-medium underline text-xs">Set it?</button>
                  <button onClick={() => setSuggestedPriority(null)} className="ml-auto text-muted-foreground text-xs">Dismiss</button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground text-xs block mb-1">Priority</span>
                {isAdmin ? (
                  <select value={task.priority} onChange={e => saveField('priority', e.target.value)}
                    className="h-7 text-xs rounded border border-input bg-background px-2 text-foreground">
                    {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                ) : <PriorityBadge priority={task.priority} />}
              </div>
              <div>
                <span className="text-muted-foreground text-xs block mb-1">Status</span>
                <select value={task.status}
                  onChange={e => saveField('status', e.target.value)}
                  className="h-7 text-xs rounded border border-input bg-background px-2 text-foreground">
                  {['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <span className="text-muted-foreground text-xs block mb-1">Due Date</span>
                {task.dueDate ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-foreground">{formatDate(task.dueDate)}</span>
                    <CountdownBadge dueDate={task.dueDate} />
                  </div>
                ) : <span className="text-xs text-muted-foreground">No due date</span>}
                {isAdmin && (
                  <input type="date" className="mt-1 h-7 text-xs rounded border border-input bg-background px-2 text-foreground w-full"
                    defaultValue={task.dueDate ? task.dueDate.slice(0, 10) : ''}
                    onChange={e => saveField('dueDate', e.target.value || null)} />
                )}
              </div>
              <div>
                <span className="text-muted-foreground text-xs block mb-1">Assignee</span>
                {isAdmin ? (
                  <select value={task.assigneeId || ''} onChange={e => saveField('assigneeId', e.target.value || null)}
                    className="h-7 text-xs rounded border border-input bg-background px-2 text-foreground w-full">
                    <option value="">Unassigned</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                ) : (
                  <span className="text-xs text-foreground">{task.assignee?.name || 'Unassigned'}</span>
                )}
              </div>
            </div>

            {(isAdmin || task.description) && (
              <div>
                <span className="text-muted-foreground text-xs block mb-1">Description</span>
                {isAdmin ? (
                  <textarea className="w-full text-sm text-foreground bg-muted/40 border border-input rounded-md p-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                    rows={3} defaultValue={task.description || ''}
                    onBlur={e => saveField('description', e.target.value)} placeholder="Add description…" />
                ) : (
                  <p className="text-sm text-foreground">{task.description || '—'}</p>
                )}
              </div>
            )}

            <Separator />

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

        {isAdmin && (
          <div className="pt-3 border-t border-border">
            <Button variant="destructive" size="sm" onClick={() => { deleteTask(taskId); onClose() }}>
              <Trash2 size={14} className="mr-1.5" /> Delete Task
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
