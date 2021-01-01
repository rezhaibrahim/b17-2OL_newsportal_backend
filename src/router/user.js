
const { Router } = require('express')
const usersController = require('../controllers/users')
const route = Router()

route.get('/profile', usersController.viewUserProfile)
route.patch('/edit-profile', usersController.editProfile)
route.delete('/delete', usersController.deleteAccount)
route.post('/create-news', usersController.createNews)
route.patch('/edit-news/:idNews', usersController.editNews)
route.delete('/delete-news/:idNews', usersController.deleteNews)
route.get('/my-news', usersController.viewMyNews)
route.get('/user-news/:id', usersController.viewUserNews)
route.get('/detail-news/:id', usersController.viewDetailNews)
route.get('/all-news', usersController.getAllNews)
route.get('/search-user', usersController.getUser)

module.exports = route
