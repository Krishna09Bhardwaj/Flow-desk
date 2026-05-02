const router = require('express').Router()
const { list, add, remove } = require('../controllers/comment.controller')
const { verifyToken } = require('../middleware/auth.middleware')

router.get('/task/:taskId', verifyToken, list)
router.post('/task/:taskId', verifyToken, add)
router.delete('/:id', verifyToken, remove)

module.exports = router
