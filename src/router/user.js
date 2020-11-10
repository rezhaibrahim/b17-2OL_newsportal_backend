
const { Router } = require('express')
const usersController = require('../controllers/users')

const route = Router()

route.post('/register', usersController.createUser)

module.exports = route
