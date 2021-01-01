const { Users } = require('../models')
const { USER_KEY } = process.env
const responseStandard = require('../helpers/response')
const Joi = require('joi')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

module.exports = {
  login: async (req, res) => {
    const data = Object.keys(req.body)
    console.log(req.body);
    if (data[0] === 'email') {
      const schemaLoginEmail = Joi.object({
        email: Joi.string().email().max(255).required(),
        password: Joi.string().min(4).max(10).required()
      })
      const { error, value } = schemaLoginEmail.validate(req.body)
      //   console.log(value)
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
            jwt.sign({ id: validEmail[0].dataValues.id }, USER_KEY, { expiresIn: 86400 /* Expired 24 Hours */ }, (_error, token) => {
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
        console.log(validUserName.length)
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
  },
  forgotPassword: async (req, res) => {
    console.log(req.body)
    const schema = Joi.object({
      email: Joi.string().email().required(),
      newPassword: Joi.string().required(),
      latePassword: Joi.string().required()
    })
    const { error, value: results } = schema.validate(req.body)

    if (error) {
      return responseStandard(res, error.message, {}, 400, false)
    }
    if (results.newPassword === results.latePassword) {
      return responseStandard(res, 'Failed to update Password', {}, 400, false)
    } else {
      const result = await Users.findOne({ where: { email: results.email } })
      console.log(result.dataValues)
      if (result) {
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(results.newPassword, salt)
        const data = await Users.update({ password: hash }, { where: { email: results.email } })
        // console.log("ini update",data);
        if (data) {
          return responseStandard(res, 'change password successfully', { data: result })
        } else {
          return responseStandard(res, 'Failed to update', {}, 400, false)
        }
      }
    }
  },
  createUser: async (req, res) => {
    const schema = Joi.object({
      email: Joi.string().email().max(255).required(),
      password: Joi.string().min(6).max(16).required(),
      userName: Joi.string().max(255).required()
    })

    const { error, value } = schema.validate(req.body)
    console.log(req.body);
    if (error) {
      return responseStandard(res, error.message, {}, 400, false)
    } else {
      const { email, password, userName } = value
      // console.log(password.length);
      const validationEmail = await Users.findAll({
        where: { email: email }
      })
      const validationUserName = await Users.findAll({
        where: { userName: userName }
      })

      if (validationEmail.length) {
        return responseStandard(res, 'Email already registered!', {}, 403, false)
      } else if (validationUserName.length) {
        return responseStandard(res, 'Username already registered!', {}, 403, false)
      } else if (password.length > 8 || password.length < 8) {
        return responseStandard(res, 'password is too short or too long, minimum and maximum 8 digits', {}, 403, false)
      } else {
        const salt = bcrypt.genSaltSync(10)
        const hashedPassword = bcrypt.hashSync(password, salt)
        // console.log(hashedPassword);
        const data = {
          email,
          password: hashedPassword,
          userName
        }

        const result = await Users.create(data)
        return responseStandard(res, 'Create user successfully', { result: result })
      }
    }
  }
}
