/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const responseStandard = require('../helpers/response')
const Joi = require('joi')
const upload = require('../helpers/upload')
const paging = require('../helpers/pagination')
const { Users, News } = require('../models')
const { Op } = require('sequelize')
const { APP_URL,APP_PORT } = process.env
module.exports = {
  viewUserProfile: async (req, res) => {
    const { id } = req.user
    const user = await Users.findByPk(id)

    if (user) {
      return responseStandard(res, 'User has been found!', { result: user })
    } else {
      return responseStandard(res, 'User not found!', {}, 404, false)
    }
  },
  editProfile: (req, res) => {
    const { id } = req.user
    const uploads = upload.single('image')

    const schema = Joi.object({
      email: Joi.string().email().max(255),
      userName: Joi.string().max(255)
    })

    uploads(req, res, async (err) => {
      if (err) {
        return responseStandard(res, err.message, {}, 400, false)
      } else {
        const image = req.file
        const { error, value } = schema.validate(req.body)
        const { email, userName } = value

        if (email || userName || image) {
          if (error) {
            return responseStandard(res, error.message, {}, 400, false)
          } else {
            await Users.update({
              email,
              userName,
              picture: image && `/uploads/${image.filename}`
            }, {
              where: {
                id
              }
            })

            return responseStandard(res, 'Update profile successfully!', {}, 200, true)
          }
        } else {
          return responseStandard(res, 'Please enter the data you want to change!', {}, 400, false)
        }
      }
    })
  },
  deleteAccount: async (req, res) => {
    const { id } = req.user
    console.log(id)
    const account = await Users.findByPk(id)
    console.log(account)
    if (account) {
      await account.destroy()
      return responseStandard(res, 'delete account success', {}, 200, true)
    } else {
      return responseStandard(res, 'Require one of the input form!', {}, 400, false)
    }
  },
  createNews: async (req, res) => {
    const { id } = req.user
    const user = await Users.findByPk(id)
    console.log(user.userName)
    const uploads = upload.single('image')

    const schema = Joi.object({
      title: Joi.string().min(10).max(100).required(),
      description: Joi.string().min(20).required(),
      reference: Joi.string().uri().max(255).required()
    })
    uploads(req, res, async (err) => {
      if (err) {
        return responseStandard(res, err.message, {}, 400, false)
      } else {
        const image = req.file
        const { error, value } = schema.validate(req.body)
        const { title, description, reference } = value
        console.log(value)

        if (image) {
          if (error) {
            return responseStandard(res, error.message, {}, 400, false)
          } else {
            const result = {
              user_id: id,
              title,
              description,
              reference,
              author: user.userName,
              picture: `/uploads/${image.filename}`
            }
            const results = await News.create(result)

            return responseStandard(res, 'Create News Successfully!', { results: results }, 200, true)
          }
        } else {
          return responseStandard(res, 'There is a problem with the image you uploaded !', {}, 400, false)
        }
      }
    })
  },
  editNews: async (req, res) => {
    const { id } = req.user
    const { idNews } = req.params
    const uploads = upload.single('image')
    const user = await Users.findByPk(id)
    const schema = Joi.object({
      title: Joi.string().min(10).max(100).required(),
      description: Joi.string().min(20).required(),
      reference: Joi.string().uri().max(255).required()
    })
    uploads(req, res, async (err) => {
      if (err) {
        return responseStandard(res, err.message, {}, 400, false)
      } else {
        const image = req.file
        const { error, value } = schema.validate(req.body)
        const { title, description, reference } = value
        console.log(value)

        if (title || description || reference || image) {
          if (error) {
            return responseStandard(res, error.message, {}, 400, false)
          } else {
            const changes = await News.update({
              title,
              description,
              reference,
              image: image && `/uploads/${image.filename}`
            }, {
              where: {
                id: idNews,
                author: user.userName
              }
            })
            // console.log(changes[0])
            if (changes[0] !== null && changes[0] !== undefined) {
              return responseStandard(res, 'Edit news successfully!', {}, 200, true)
            } else {
              return responseStandard(res, 'Edit news failed!', {}, 400, false)
            }
          }
        } else {
          return responseStandard(res, 'There is a problem with the image you uploaded !', {}, 400, false)
        }
      }
    })
  },
  deleteNews: async (req, res) => {
    const { id } = req.user
    const { idNews } = req.params
    const user = await Users.findByPk(id)
    const destroy = await News.destroy({
      where: {
        id: idNews,
        author: user.userName
      }
    })

    if (destroy !== null && destroy !== undefined) {
      return responseStandard(res, 'Delete news successfully!', {})
    } else {
      return responseStandard(res, 'Delete news failed!', {}, 400, false)
    }
  },
  viewMyNews: async (req, res) => {
    const { id } = req.user
    const count = await News.count({where:{user_id:id}})
        const page = paging(req, count)
        const { offset, pageInfo } = page
        console.log(offset);
        const { limitData: limit } = pageInfo
        const result = await News.findAll({where:{user_id:id},limit,offset})
        return responseStandard(res, 'List My News', { result, pageInfo })
  }
  
}
