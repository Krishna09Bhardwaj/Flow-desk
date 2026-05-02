const router = require('express').Router()
const { list, create, getOne, update, archive, remove, addMember, removeMember } = require('../controllers/project.controller')
const { verifyToken } = require('../middleware/auth.middleware')
const { isAdmin } = require('../middleware/role.middleware')
const { validate } = require('../middleware/validate.middleware')
const { projectValidator } = require('../validators/project.validator')

router.get('/', verifyToken, list)
router.post('/', verifyToken, isAdmin, projectValidator, validate, create)
router.get('/:id', verifyToken, getOne)
router.patch('/:id', verifyToken, isAdmin, projectValidator, validate, update)
router.patch('/:id/archive', verifyToken, isAdmin, archive)
router.delete('/:id', verifyToken, isAdmin, remove)
router.post('/:id/members', verifyToken, isAdmin, addMember)
router.delete('/:id/members/:userId', verifyToken, isAdmin, removeMember)

module.exports = router
