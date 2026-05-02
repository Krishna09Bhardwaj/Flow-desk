const router = require('express').Router()
const { list, markOne, markAll } = require('../controllers/notification.controller')
const { verifyToken } = require('../middleware/auth.middleware')

router.get('/', verifyToken, list)
router.patch('/read-all', verifyToken, markAll)
router.patch('/:id/read', verifyToken, markOne)

module.exports = router
