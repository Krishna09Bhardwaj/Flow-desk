const { verifyAccessToken } = require('../utils/jwt.utils')
const prisma = require('../config/prisma')

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' })
  }
  const token = authHeader.split(' ')[1]
  try {
    const decoded = verifyAccessToken(token)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true, avatarUrl: true }
    })
    if (!user) return res.status(401).json({ message: 'User not found' })
    req.user = user
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

module.exports = { verifyToken }
