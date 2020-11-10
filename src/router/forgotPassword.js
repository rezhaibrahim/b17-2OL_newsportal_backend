const { Router } = require('express')
const router = Router()
const { forgotPassword } = require('../controllers/auth')

router.patch('/forgot-password', forgotPassword)

module.exports = router
