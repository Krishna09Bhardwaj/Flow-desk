const prisma = require('../config/prisma')

const adminStats = async (req, res) => {
  try {
    const now = new Date()

    const [totalProjects, totalTasks, totalMembers, doneTasks, overdueTasks, tasksByPriority, tasksByStatus, recentActivity, members] = await Promise.all([
      prisma.project.count({ where: { status: 'ACTIVE' } }),
      prisma.task.count(),
      prisma.user.count({ where: { role: 'MEMBER' } }),
      prisma.task.count({ where: { status: 'DONE' } }),
      prisma.task.findMany({
        where: { dueDate: { lt: now }, status: { not: 'DONE' } },
        include: { assignee: { select: { id: true, name: true, avatarUrl: true } }, project: { select: { id: true, name: true } } },
        orderBy: { dueDate: 'asc' },
        take: 10,
      }),
      prisma.task.groupBy({ by: ['priority'], _count: { id: true } }),
      prisma.task.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.activityLog.findMany({
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.user.findMany({
        where: { role: 'MEMBER' },
        select: { id: true, name: true, avatarUrl: true },
      }),
    ])

    const workload = await Promise.all(
      members.map(async (m) => ({
        ...m,
        openTasks: await prisma.task.count({ where: { assigneeId: m.id, status: { not: 'DONE' } } }),
      }))
    )

    const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

    res.json({
      totalProjects,
      totalTasks,
      totalMembers,
      doneTasks,
      completionRate,
      overdueCount: overdueTasks.length,
      overdueTasks,
      tasksByPriority,
      tasksByStatus,
      recentActivity,
      workload: workload.sort((a, b) => b.openTasks - a.openTasks),
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

const memberStats = async (req, res) => {
  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(todayStart.getTime() + 86400000)
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())

    const [todayTasks, overdueTasks, weekDone, weekTotal, projects] = await Promise.all([
      prisma.task.findMany({
        where: { assigneeId: req.user.id, dueDate: { gte: todayStart, lt: todayEnd }, status: { not: 'DONE' } },
        include: { project: { select: { id: true, name: true, color: true } } },
      }),
      prisma.task.findMany({
        where: { assigneeId: req.user.id, dueDate: { lt: now }, status: { not: 'DONE' } },
        include: { project: { select: { id: true, name: true, color: true } } },
        orderBy: { dueDate: 'asc' },
      }),
      prisma.task.count({ where: { assigneeId: req.user.id, status: 'DONE', updatedAt: { gte: weekStart } } }),
      prisma.task.count({ where: { assigneeId: req.user.id, createdAt: { gte: weekStart } } }),
      prisma.projectMember.findMany({
        where: { userId: req.user.id },
        include: { project: { include: { _count: { select: { tasks: true } } } } },
      }),
    ])

    const weekCompletionRate = weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 0

    res.json({
      todayTasks,
      overdueTasks,
      weekCompletionRate,
      projects: projects.map(pm => pm.project),
    })
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { adminStats, memberStats }
