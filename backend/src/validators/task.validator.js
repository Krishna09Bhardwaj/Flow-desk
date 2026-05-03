const { body } = require('express-validator')

const dueDateRule = body('dueDate').optional().isISO8601().toDate().custom((date) => {
  if (date) {
    const year = new Date(date).getFullYear()
    if (year < 2020 || year > 2099) throw new Error('Due date year must be between 2020 and 2099')
  }
  return true
})

const taskCreateValidator = [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('description').optional().trim(),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']),
  dueDateRule,
  body('assigneeId').optional().isString(),
]

const taskUpdateValidator = [
  body('title').optional().trim(),
  body('description').optional().trim(),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']),
  dueDateRule,
  body('assigneeId').optional().isString(),
]

module.exports = { taskCreateValidator, taskUpdateValidator }
