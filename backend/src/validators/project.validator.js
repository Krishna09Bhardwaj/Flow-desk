const { body } = require('express-validator')

const projectValidator = [
  body('name').trim().notEmpty().withMessage('Project name is required'),
  body('description').optional().trim(),
  body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Invalid color hex'),
]

module.exports = { projectValidator }
