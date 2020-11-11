
const { Router } = require('express')
const usersController = require('../controllers/users')
const route = Router()

route.get('/find', usersController.viewUserProfile)
route.patch('/edit-profile', usersController.editProfile)
route.delete('/delete', usersController.deleteAccount)
route.post('/create-news', usersController.createNews)
route.patch('/edit-news/:idNews', usersController.editNews)
route.delete('/delete-news/:idNews', usersController.deleteNews)
module.exports = route
