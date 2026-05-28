const router = require('express').Router()
const { body } = require('express-validator')
const { list, add, remove } = require('../controllers/comment.controller')
const { verifyToken } = require('../middleware/auth.middleware')
const { validate } = require('../middleware/validate.middleware')

const addCommentValidator = [
  body('content').trim().notEmpty().withMessage('Comment content is required')
    .isLength({ max: 2000 }).withMessage('Comment must be under 2000 characters'),
]

router.get('/task/:taskId', verifyToken, list)
router.post('/task/:taskId', verifyToken, addCommentValidator, validate, add)
router.delete('/:id', verifyToken, remove)

module.exports = router
