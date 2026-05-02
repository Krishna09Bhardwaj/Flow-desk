const router = require('express').Router()
const { getAll, getByProject } = require('../controllers/activity.controller')
const { verifyToken } = require('../middleware/auth.middleware')
const { isAdmin } = require('../middleware/role.middleware')

router.get('/', verifyToken, isAdmin, getAll)
router.get('/project/:id', verifyToken, getByProject)

module.exports = router
