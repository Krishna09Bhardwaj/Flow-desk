const { body } = require('express-validator')

// Accepts a valid date string or null/empty (to clear the field)
const dueDateRule = body('dueDate')
  .optional({ nullable: true })
  .custom((value) => {
    if (value === null || value === '' || value === undefined) return true
    const date = new Date(value)
    if (isNaN(date.getTime())) throw new Error('Invalid date')
    const year = date.getFullYear()
    if (year < 2020 || year > 2099) throw new Error('Due date year must be between 2020 and 2099')
    return true
  })

const taskCreateValidator = [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('description').optional({ nullable: true }).trim(),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']),
  dueDateRule,
  body('assigneeId').optional({ nullable: true }),
]

const taskUpdateValidator = [
  body('title').optional().trim(),
  body('description').optional({ nullable: true }).trim(),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']),
  dueDateRule,
  body('assigneeId').optional({ nullable: true }),
]

module.exports = { taskCreateValidator, taskUpdateValidator }
