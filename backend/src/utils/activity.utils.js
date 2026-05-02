const prisma = require('../config/prisma')

const logActivity = async (userId, action, entityType, entityId, metadata = null, projectId = null, taskId = null) => {
  try {
    await prisma.activityLog.create({
      data: { userId, action, entityType, entityId, metadata, projectId, taskId }
    })
  } catch (_) {}
}

module.exports = { logActivity }
