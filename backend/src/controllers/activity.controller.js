const prisma = require('../config/prisma')

const userSelect = { id: true, name: true, avatarUrl: true }

const getAll = async (req, res) => {
  try {
    const logs = await prisma.activityLog.findMany({
      include: { user: { select: userSelect } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    res.json(logs)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

const getByProject = async (req, res) => {
  try {
    const logs = await prisma.activityLog.findMany({
      where: { projectId: req.params.id },
      include: { user: { select: userSelect } },
      orderBy: { createdAt: 'desc' },
      take: 30,
    })
    res.json(logs)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { getAll, getByProject }
