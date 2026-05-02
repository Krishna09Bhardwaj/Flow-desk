const router = require('express').Router()
const { adminStats, memberStats } = require('../controllers/dashboard.controller')
const { verifyToken } = require('../middleware/auth.middleware')
const { isAdmin } = require('../middleware/role.middleware')

router.get('/admin', verifyToken, isAdmin, adminStats)
router.get('/member', verifyToken, memberStats)

module.exports = router
