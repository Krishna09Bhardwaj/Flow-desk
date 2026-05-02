const { body } = require('express-validator')

const taskValidator = [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('description').optional().trim(),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']),
  body('dueDate').optional().isISO8601().toDate(),
  body('assigneeId').optional().isString(),
]

module.exports = { taskValidator }
