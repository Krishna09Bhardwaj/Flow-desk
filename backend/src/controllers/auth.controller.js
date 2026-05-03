const bcrypt = require('bcryptjs')
const prisma = require('../config/prisma')
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt.utils')

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(409).json({ message: 'Email already registered' })

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: role || 'MEMBER' },
      select: { id: true, name: true, email: true, role: true, avatarUrl: true, createdAt: true },
    })

    const accessToken = signAccessToken(user.id)
    const refreshToken = signRefreshToken(user.id)
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    })

    res.cookie('refreshToken', refreshToken, COOKIE_OPTS)
    res.status(201).json({ user, accessToken })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' })

    const accessToken = signAccessToken(user.id)
    const refreshToken = signRefreshToken(user.id)
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    })

    res.cookie('refreshToken', refreshToken, COOKIE_OPTS)
    const { password: _, ...safeUser } = user
    res.json({ user: safeUser, accessToken })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

const refresh = async (req, res) => {
  const token = req.cookies?.refreshToken
  if (!token) return res.status(401).json({ message: 'No refresh token' })

  let stored
  try {
    stored = await prisma.refreshToken.findUnique({ where: { token } })
  } catch {
    // DB temporarily unavailable — return 503 so the frontend does NOT force-logout
    return res.status(503).json({ message: 'Service temporarily unavailable' })
  }

  if (!stored || stored.expiresAt < new Date()) {
    return res.status(401).json({ message: 'Refresh token invalid or expired' })
  }

  try {
    const decoded = verifyRefreshToken(token)
    const accessToken = signAccessToken(decoded.userId)
    res.json({ accessToken })
  } catch {
    res.status(401).json({ message: 'Invalid refresh token' })
  }
}

const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken
    if (token) await prisma.refreshToken.deleteMany({ where: { token } })
    res.clearCookie('refreshToken')
    res.json({ message: 'Logged out' })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

const me = (req, res) => {
  res.json({ user: req.user })
}

module.exports = { signup, login, refresh, logout, me }
