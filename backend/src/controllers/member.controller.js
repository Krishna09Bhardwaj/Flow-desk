const prisma = require('../config/prisma')

const listAll = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, avatarUrl: true, createdAt: true },
      orderBy: { name: 'asc' },
    })
    res.json(users)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

const getWorkload = async (req, res) => {
  try {
    const count = await prisma.task.count({
      where: { assigneeId: req.params.id, status: { not: 'DONE' } },
    })
    res.json({ userId: req.params.id, openTasks: count })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { listAll, getWorkload }
