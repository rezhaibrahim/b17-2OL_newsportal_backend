
const { Router } = require('express')
const authController = require('../controllers/auth')

const route = Router()

route.post('/login', authController.login)

module.exports = route
