const prisma = require('../config/prisma')

const createNotification = async (userId, type, message) => {
  try {
    await prisma.notification.create({ data: { userId, type, message } })
  } catch (err) {
    console.error(`[notification] Failed to create ${type} for user ${userId}:`, err?.message || err)
  }
}

module.exports = { createNotification }
