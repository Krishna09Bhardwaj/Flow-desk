const prisma = require('../config/prisma')
const { logActivity } = require('../utils/activity.utils')
const { createNotification } = require('../utils/notification.utils')

const userSelect = { id: true, name: true, email: true, avatarUrl: true, role: true }

const list = async (req, res) => {
  try {
    const where = req.user.role === 'ADMIN'
      ? {}
      : { members: { some: { userId: req.user.id } } }

    const projects = await prisma.project.findMany({
      where,
      include: {
        createdBy: { select: userSelect },
        members: { include: { user: { select: userSelect } } },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json(projects)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

const create = async (req, res) => {
  try {
    const { name, description, color } = req.body
    const project = await prisma.project.create({
      data: { name, description, color, createdById: req.user.id },
      include: { createdBy: { select: userSelect }, members: true, _count: { select: { tasks: true } } },
    })
    await logActivity(req.user.id, 'PROJECT_CREATED', 'project', project.id, { name }, project.id)
    res.status(201).json(project)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

const getOne = async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        createdBy: { select: userSelect },
        members: { include: { user: { select: userSelect } } },
        tasks: { include: { assignee: { select: userSelect }, createdBy: { select: userSelect } }, orderBy: { createdAt: 'desc' } },
        _count: { select: { tasks: true } },
      },
    })
    if (!project) return res.status(404).json({ message: 'Project not found' })

    if (req.user.role !== 'ADMIN') {
      const isMember = project.members.some(m => m.userId === req.user.id)
      if (!isMember) return res.status(403).json({ message: 'Not a project member' })
    }
    res.json(project)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

const update = async (req, res) => {
  try {
    const { name, description, color } = req.body
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { name, description, color },
    })
    await logActivity(req.user.id, 'PROJECT_UPDATED', 'project', project.id, { name }, project.id)
    res.json(project)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

const archive = async (req, res) => {
  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { status: 'ARCHIVED' },
    })
    await logActivity(req.user.id, 'PROJECT_ARCHIVED', 'project', project.id, {}, project.id)
    res.json(project)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

const remove = async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } })
    res.json({ message: 'Project deleted' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

const addMember = async (req, res) => {
  try {
    const { userId } = req.body
    if (!userId) return res.status(400).json({ message: 'userId required' })

    const user = await prisma.user.findUnique({ where: { id: userId }, select: userSelect })
    if (!user) return res.status(404).json({ message: 'User not found' })

    await prisma.projectMember.upsert({
      where: { userId_projectId: { userId, projectId: req.params.id } },
      update: {},
      create: { userId, projectId: req.params.id },
    })
    await logActivity(req.user.id, 'MEMBER_ADDED', 'project', req.params.id, { userId, userName: user.name }, req.params.id)
    await createNotification(userId, 'PROJECT_ADDED', `You have been added to a project`)
    res.json({ message: 'Member added' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

const removeMember = async (req, res) => {
  try {
    await prisma.projectMember.delete({
      where: { userId_projectId: { userId: req.params.userId, projectId: req.params.id } },
    })
    await logActivity(req.user.id, 'MEMBER_REMOVED', 'project', req.params.id, { userId: req.params.userId }, req.params.id)
    res.json({ message: 'Member removed' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { list, create, getOne, update, archive, remove, addMember, removeMember }
