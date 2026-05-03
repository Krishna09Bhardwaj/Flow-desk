const router = require('express').Router()
const { listByProject, create, getOne, update, remove, myTasks, remind } = require('../controllers/task.controller')
const { verifyToken } = require('../middleware/auth.middleware')
const { isAdmin } = require('../middleware/role.middleware')
const { validate } = require('../middleware/validate.middleware')
const { taskCreateValidator, taskUpdateValidator } = require('../validators/task.validator')

router.get('/my', verifyToken, myTasks)
router.get('/project/:projectId', verifyToken, listByProject)
router.post('/project/:projectId', verifyToken, taskCreateValidator, validate, create)
router.get('/:id', verifyToken, getOne)
router.patch('/:id', verifyToken, taskUpdateValidator, validate, update)
router.delete('/:id', verifyToken, isAdmin, remove)
router.post('/:id/remind', verifyToken, isAdmin, remind)

module.exports = router
