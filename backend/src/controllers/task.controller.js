const prisma = require('../config/prisma')
const { logActivity } = require('../utils/activity.utils')
const { createNotification } = require('../utils/notification.utils')

const userSelect = { id: true, name: true, email: true, avatarUrl: true }

const isMemberOf = async (userId, projectId) => {
  const m = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
  })
  return !!m
}

const listByProject = async (req, res) => {
  try {
    const { projectId } = req.params
    if (req.user.role !== 'ADMIN' && !(await isMemberOf(req.user.id, projectId))) {
      return res.status(403).json({ message: 'Not a project member' })
    }
    const { priority, assigneeId, status } = req.query
    const where = { projectId, ...(priority && { priority }), ...(assigneeId && { assigneeId }), ...(status && { status }) }
    const tasks = await prisma.task.findMany({
      where,
      include: { assignee: { select: userSelect }, createdBy: { select: userSelect }, _count: { select: { comments: true } } },
      orderBy: { createdAt: 'desc' },
    })
    res.json(tasks)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

const create = async (req, res) => {
  try {
    const { projectId } = req.params
    if (req.user.role !== 'ADMIN' && !(await isMemberOf(req.user.id, projectId))) {
      return res.status(403).json({ message: 'Not a project member' })
    }
    const { title, description, priority, status, dueDate, assigneeId } = req.body
    const task = await prisma.task.create({
      data: { title, description, priority, status, dueDate, assigneeId, projectId, createdById: req.user.id },
      include: { assignee: { select: userSelect }, createdBy: { select: userSelect } },
    })
    await logActivity(req.user.id, 'TASK_CREATED', 'task', task.id, { title }, projectId, task.id)
    if (assigneeId && assigneeId !== req.user.id) {
      await createNotification(assigneeId, 'TASK_ASSIGNED', `You have been assigned a new task: "${title}"`)
    }
    res.status(201).json(task)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

const getOne = async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        assignee: { select: userSelect },
        createdBy: { select: userSelect },
        comments: { include: { user: { select: userSelect } }, orderBy: { createdAt: 'asc' } },
        project: { select: { id: true, name: true } },
      },
    })
    if (!task) return res.status(404).json({ message: 'Task not found' })

    if (req.user.role !== 'ADMIN' && !(await isMemberOf(req.user.id, task.projectId))) {
      return res.status(403).json({ message: 'Not a project member' })
    }
    res.json(task)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

const update = async (req, res) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } })
    if (!task) return res.status(404).json({ message: 'Task not found' })

    if (req.user.role !== 'ADMIN') {
      if (!(await isMemberOf(req.user.id, task.projectId))) {
        return res.status(403).json({ message: 'Not a project member' })
      }
      const allowedFields = ['status']
      const requestedFields = Object.keys(req.body)
      const unauthorized = requestedFields.filter(f => !allowedFields.includes(f))
      if (unauthorized.length > 0 && task.assigneeId !== req.user.id) {
        return res.status(403).json({ message: 'Members can only update status of their own tasks' })
      }
    }

    const { title, description, priority, status, dueDate, assigneeId } = req.body
    const prevAssigneeId = task.assigneeId
    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: { title, description, priority, status, dueDate, assigneeId },
      include: { assignee: { select: userSelect }, createdBy: { select: userSelect } },
    })

    await logActivity(req.user.id, 'TASK_UPDATED', 'task', task.id, { title: updated.title, status: updated.status }, task.projectId, task.id)

    if (assigneeId && assigneeId !== prevAssigneeId && assigneeId !== req.user.id) {
      await createNotification(assigneeId, 'TASK_ASSIGNED', `You have been assigned: "${updated.title}"`)
    }
    res.json(updated)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

const remove = async (req, res) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } })
    if (!task) return res.status(404).json({ message: 'Task not found' })
    await prisma.task.delete({ where: { id: req.params.id } })
    await logActivity(req.user.id, 'TASK_DELETED', 'task', req.params.id, { title: task.title }, task.projectId)
    res.json({ message: 'Task deleted' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

const myTasks = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { assigneeId: req.user.id },
      include: { project: { select: { id: true, name: true, color: true } }, createdBy: { select: userSelect } },
      orderBy: { dueDate: 'asc' },
    })
    res.json(tasks)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { listByProject, create, getOne, update, remove, myTasks }
