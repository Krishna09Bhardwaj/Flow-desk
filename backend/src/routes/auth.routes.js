const router = require('express').Router()
const { signup, login, refresh, logout, me } = require('../controllers/auth.controller')
const { signupValidator, loginValidator } = require('../validators/auth.validator')
const { validate } = require('../middleware/validate.middleware')
const { verifyToken } = require('../middleware/auth.middleware')

router.post('/signup', signupValidator, validate, signup)
router.post('/login', loginValidator, validate, login)
router.post('/refresh', refresh)
router.post('/logout', verifyToken, logout)
router.get('/me', verifyToken, me)

module.exports = router
