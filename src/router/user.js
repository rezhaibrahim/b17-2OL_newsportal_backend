
const { Router } = require('express')
const usersController = require('../controllers/users')
const uploadHelper = require('../helpers/upload')
const route = Router()

route.get('/find', usersController.viewUserProfile)
route.patch('/edit', usersController.editProfile)
route.delete('/delete', usersController.deleteAccount)
module.exports = route
