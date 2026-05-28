const prisma = require('../config/prisma')

const isAdmin = async (req, res, next) => {
  // Verify the current role from DB to catch demotions/promotions since the JWT was issued
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true },
    })
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Admin access required' })
    }
    // Sync the role in case it changed
    req.user.role = user.role
    next()
  } catch {
    return res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { isAdmin }
