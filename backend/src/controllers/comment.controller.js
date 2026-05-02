const prisma = require('../config/prisma')
const { logActivity } = require('../utils/activity.utils')
const { createNotification } = require('../utils/notification.utils')

const userSelect = { id: true, name: true, email: true, avatarUrl: true }

const isMemberOf = async (userId, projectId) => {
  const m = await prisma.projectMember.findUnique({ where: { userId_projectId: { userId, projectId } } })
  return !!m
}

const list = async (req, res) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.taskId } })
    if (!task) return res.status(404).json({ message: 'Task not found' })
    if (req.user.role !== 'ADMIN' && !(await isMemberOf(req.user.id, task.projectId))) {
      return res.status(403).json({ message: 'Not a project member' })
    }
    const comments = await prisma.comment.findMany({
      where: { taskId: req.params.taskId },
      include: { user: { select: userSelect } },
      orderBy: { createdAt: 'asc' },
    })
    res.json(comments)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

const add = async (req, res) => {
  try {
    const { content } = req.body
    if (!content?.trim()) return res.status(422).json({ message: 'Content is required' })

    const task = await prisma.task.findUnique({ where: { id: req.params.taskId } })
    if (!task) return res.status(404).json({ message: 'Task not found' })
    if (req.user.role !== 'ADMIN' && !(await isMemberOf(req.user.id, task.projectId))) {
      return res.status(403).json({ message: 'Not a project member' })
    }

    const comment = await prisma.comment.create({
      data: { content, taskId: req.params.taskId, userId: req.user.id },
      include: { user: { select: userSelect } },
    })
    await logActivity(req.user.id, 'COMMENT_ADDED', 'task', task.id, { content: content.slice(0, 50) }, task.projectId, task.id)

    if (task.assigneeId && task.assigneeId !== req.user.id) {
      await createNotification(task.assigneeId, 'COMMENT_ADDED', `New comment on your task: "${task.title}"`)
    }
    if (task.createdById && task.createdById !== req.user.id && task.createdById !== task.assigneeId) {
      await createNotification(task.createdById, 'COMMENT_ADDED', `New comment on task: "${task.title}"`)
    }
    res.status(201).json(comment)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

const remove = async (req, res) => {
  try {
    const comment = await prisma.comment.findUnique({ where: { id: req.params.id } })
    if (!comment) return res.status(404).json({ message: 'Comment not found' })
    if (comment.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Cannot delete another user\'s comment' })
    }
    await prisma.comment.delete({ where: { id: req.params.id } })
    res.json({ message: 'Comment deleted' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { list, add, remove }
