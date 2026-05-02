const router = require('express').Router()
const { listAll, getWorkload } = require('../controllers/member.controller')
const { verifyToken } = require('../middleware/auth.middleware')
const { isAdmin } = require('../middleware/role.middleware')

router.get('/', verifyToken, isAdmin, listAll)
router.get('/:id/workload', verifyToken, isAdmin, getWorkload)

module.exports = router
