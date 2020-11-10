
const { Router } = require('express')
const usersController = require('../controllers/users')

const route = Router()

route.get('/find', usersController.viewUserProfile)

module.exports = route
