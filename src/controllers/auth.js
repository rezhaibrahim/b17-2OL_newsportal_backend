const { Users } = require('../models')
const { USER_KEY } = process.env
const responseStandard = require('../helpers/response')
const Joi = require('joi')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

module.exports = {
  login: async (req, res) => {
    const data = Object.keys(req.body)
    if (data[0] === 'email') {
      const schemaLoginEmail = Joi.object({
        email: Joi.string().max(255).required(),
        password: Joi.string().min(4).max(10).required()
      })
      const { error, value } = schemaLoginEmail.validate(req.body)
      console.log(value)
      if (error) {
        return responseStandard(res, error.message, {}, 400, false)
      } else {
        const { email, password } = value
        const validEmail = await Users.findAll({
          where: { email: email }
        })

        if (validEmail.length) {
          const isPasswordMatch = bcrypt.compareSync(password, validEmail[0].dataValues.password)

          if (isPasswordMatch) {
            jwt.sign({ id: validEmail[0].dataValues.id }, USER_KEY, { expiresIn: '1d' }, (_error, token) => {
              return responseStandard(res, 'Login success!', { token })
            })
          } else {
            return responseStandard(res, 'Wrong password!', {}, 404, false)
          }
        } else {
          return responseStandard(res, 'Email not found!', {}, 404, false)
        }
      }
    } else if (data[0] === 'userName') {
      const schemaLoginUserName = Joi.object({
        userName: Joi.string().max(255).required(),
        password: Joi.string().min(8).max(8).required()
      })
      const { error, value } = schemaLoginUserName.validate(req.body)
      console.log(value)
      if (error) {
        return responseStandard(res, error.message, {}, 400, false)
      } else {
        const { userName, password } = value
        const validUserName = await Users.findAll({
          where: { userName: userName }
        })

        if (validUserName.length) {
          const isPasswordMatch = bcrypt.compareSync(password, validUserName[0].dataValues.password)

          if (isPasswordMatch) {
            jwt.sign({ id: validUserName[0].dataValues.id }, USER_KEY, { expiresIn: '1d' }, (_error, token) => {
              return responseStandard(res, 'Login success!', { token })
            })
          } else {
            return responseStandard(res, 'Wrong password!', {}, 404, false)
          }
        } else {
          return responseStandard(res, 'userName not found!', {}, 404, false)
        }
      }
    }
  }
}
