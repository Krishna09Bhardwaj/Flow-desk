const prisma = require('../config/prisma')

const createNotification = async (userId, type, message) => {
  try {
    await prisma.notification.create({ data: { userId, type, message } })
  } catch (_) {}
}

module.exports = { createNotification }
