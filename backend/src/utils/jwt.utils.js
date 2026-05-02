const jwt = require('jsonwebtoken')

const signAccessToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' })

const signRefreshToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })

const verifyAccessToken = (token) =>
  jwt.verify(token, process.env.JWT_ACCESS_SECRET)

const verifyRefreshToken = (token) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET)

module.exports = { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken }
