const prisma = require('../config/prisma')

const logActivity = async (userId, action, entityType, entityId, metadata = null, projectId = null, taskId = null) => {
  try {
    await prisma.activityLog.create({
      data: { userId, action, entityType, entityId, metadata, projectId, taskId }
    })
  } catch (err) {
    console.error(`[activity] Failed to log action ${action} for user ${userId}:`, err?.message || err)
  }
}

module.exports = { logActivity }
