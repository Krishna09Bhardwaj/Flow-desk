const prisma = require('../config/prisma')

const list = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
      take: 50,
    })
    res.json(notifications)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

const markOne = async (req, res) => {
  try {
    const notif = await prisma.notification.findUnique({ where: { id: req.params.id } })
    if (!notif || notif.userId !== req.user.id) return res.status(404).json({ message: 'Not found' })
    const updated = await prisma.notification.update({ where: { id: req.params.id }, data: { isRead: true } })
    res.json(updated)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

const markAll = async (req, res) => {
  try {
    await prisma.notification.updateMany({ where: { userId: req.user.id, isRead: false }, data: { isRead: true } })
    res.json({ message: 'All marked as read' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { list, markOne, markAll }
