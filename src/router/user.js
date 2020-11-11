
const { Router } = require('express')
const usersController = require('../controllers/users')
const route = Router()

route.get('/find', usersController.viewUserProfile)
route.patch('/edit', usersController.editProfile)
route.delete('/delete', usersController.deleteAccount)
route.post('/create-news', usersController.createNews)
module.exports = route
