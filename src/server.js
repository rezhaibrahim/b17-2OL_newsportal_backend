const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
const { APP_PORT, APP_IP_ADDRESS } = process.env
// import
const usersRoute = require('./router/user')
const authRoute = require('./router/auth')
const forgotPasswordRoute = require('./router/forgotPassword')
const authMidlleware = require('../src/middlewares/auth')
// middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(morgan('dev'))
app.use(cors())
app.use('/uploads', express.static('assets/uploads'))

//
app.use('/', authRoute)
app.use('/', forgotPasswordRoute)
app.use('/users', authMidlleware, usersRoute)

app.get('/', async (req, res) => {
  console.log('connection success!')
  return res.status(200).send({
    message: 'connection success!'
  })
})

const server = app.listen(APP_PORT, APP_IP_ADDRESS, () => {
  const host = server.address().address
  const port = server.address().port
  console.log('App listening  http://%s:%s', host, port)
})
