/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const responseStandard = require('../helpers/response')
const Joi = require('joi')
const upload = require('../helpers/upload')
const { Users,News } = require('../models')
const news = require('../models/news')

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
    const uploadImage = upload.single('image')

    const schema = Joi.object({
      email: Joi.string().email().max(255),
      userName: Joi.string().max(255)
    })

    uploadImage(req, res, async (err) => {
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
    uploads(req, res, async (err)=>{
      if (err) {
        return responseStandard(res, err.message, {}, 400, false)
      } else{
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

              return responseStandard(res, 'Create News Successfully!',{results:results}, 200, true)
            }
        } else {
          return responseStandard(res, 'There is a problem with the image you uploaded !',{},400,false)
        }
      }
    })
  }
}
