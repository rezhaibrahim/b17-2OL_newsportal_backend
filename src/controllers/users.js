/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const responseStandard = require('../helpers/response')
const Joi = require('joi')
const upload = require('../helpers/upload')
const paging = require('../helpers/pagination')
const { Users,sequelize, News } = require('../models')
const { Op } = require('sequelize')
const { APP_IP_ADDRESS, APP_PORT } = process.env
const qs = require('querystring')
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
    const uploads = upload.single('picture')

    const schema = Joi.object({
      email: Joi.string().email().max(255),
      userName: Joi.string().max(255)
    })

    uploads(req, res, async (err) => {
      if (err) {
        return responseStandard(res, err.message, {}, 400, false)
      } else {
        const picture = req.file
        console.log(picture);
        const { error, value } = schema.validate(req.body)
        const { email, userName } = value

        if (email || userName || picture) {
          if (error) {
            return responseStandard(res, error.message, {}, 400, false)
          } else {
            await Users.update({
              email,
              userName,
              picture: picture && `/uploads/${picture.filename}`
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
    // console.log(user.userName)
    const uploads = upload.single('picture')

    const schema = Joi.object({
      title: Joi.string().min(10).max(100).required(),
      description: Joi.string().min(20).required(),
      reference: Joi.string().max(255).required()
    })
    uploads(req, res, async (err) => {
      if (err) {
        return responseStandard(res, err.message, {}, 400, false)
      } else {
        const picture = req.file
        console.log('cek',req.file);
        const { error, value } = schema.validate(req.body)
        // console.log(value);
        const { title, description, reference } = value

        if (picture) {
          if (error) {
            return responseStandard(res, error.message, {}, 400, false)
          } else {
            const result = {
              user_id: id,
              title,
              description,
              reference,
              author: user.userName,
              picture: `/uploads/${picture.filename}`
            }
            const results = await News.create(result)
                console.log("query",results);
            return responseStandard(res, 'Create News Successfully!', { result: results }, 200, true)
          }
        } else {
          return responseStandard(res, 'There is a problem with the picture you uploaded !', {}, 400, false)
        }
      }
    })
  },
  editNews: async (req, res) => {
    const { id } = req.user
    const { idNews } = req.params
    const uploads = upload.single('picture')
    const user = await Users.findByPk(id)
    const schema = Joi.object({
      title: Joi.string().min(10).max(100),
      description: Joi.string().min(20),
      reference: Joi.string().uri().max(255)
    })
    uploads(req, res, async (err) => {
      if (err) {
        return responseStandard(res, err.message, {}, 400, false)
      } else {
        const picture = req.file
        const { error, value } = schema.validate(req.body)
        const { title, description, reference } = value
        console.log(value)

        if (title || description || reference || picture) {
          if (error) {
            return responseStandard(res, error.message, {}, 400, false)
          } else {
            const changes = await News.update({
              title,
              description,
              reference,
              picture: picture && `/uploads/${picture.filename}`
            }, {
              where: {
                id: idNews,
                // author: user.userName
              }
            })
            // console.log(changes[0])
           
              return responseStandard(res, 'Edit news successfully!', {}, 200, true)
          }
        } else {
          return responseStandard(res, 'There is a problem with the picture you uploaded !', {}, 400, false)
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
        // author: user.userName
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
    let { search } = req.query
    if (!search) {
      search = ''
    }

    console.log('cek', req.query)
    const count = await News.count({ where: { user_id: id } })
    const page = paging(req, count)
    const { offset, pageInfo } = page
    console.log(offset)
    const { limitData: limit } = pageInfo

    const result = await News.findAll({
      where: {
        user_id: id,
        [Op.or]: [{
          title: {
            [Op.substring]: search
          }
        }]
      },
      limit,
      offset
    })
    console.log(result)
    return responseStandard(res, 'List My News', { result, pageInfo })
  },
  viewDetailNews: async (req, res) => {
    const { id } = req.params

    const schema = Joi.object({
      id: Joi.number().integer().min(1)
    })
    const { error, value } = schema.validate({ id: id })
    if (error) {
      return responseStandard(res, error.message, {}, 400, false)
    } else {
      const { id } = value
      const viewMyNewsById = await News.findByPk(id , {
        include: {
          model: Users,
          as: 'Author',
          attributes: ['id', 'userName', 'picture'],
          required: true
        },
        attributes: ['id', 'title', 'description','reference','author', 'picture', 'createdAt', 'updatedAt']
      }
        )

      if (viewMyNewsById) {
        return responseStandard(res, 'Successfully view news by!', { result: viewMyNewsById })
      } else {
        return responseStandard(res, 'News not found!', {}, 404, false)
      }
    }
  },
  getAllNews: async (req, res) => {
    let { page, limit, search } = req.query

    if (!limit) {
      limit = 10
    } else {
      const schema = Joi.object({
        limit: Joi.number().integer().min(1)
      })

      const { error, value } = schema.validate({ limit: limit })

      if (error) {
        return responseStandard(res, error.message, {}, 400, false)
      }

      limit = value.limit
    }

    if (!page) {
      page = 1
    } else {
      const schema = Joi.object({
        page: Joi.number().integer().min(1)
      })

      const { error, value } = schema.validate({ page: page })

      if (error) {
        return responseStandard(res, error.message, {}, 400, false)
      }

      page = value.page
    }

    if (!search) {
      search = ''
    }

    const pageInfo = {
      count: 0,
      pages: 0,
      currentPage: page,
      limitPerPage: limit,
      nextLink: null,
      prevLink: null
    }

    const data = await News.findAll({
      include: {
        model: Users,
        as: 'Author',
        attributes: ['id', 'userName', 'picture'],
        required: true
      },
      attributes: ['id', 'title', [sequelize.fn('substr', sequelize.col('News.description'), 1, 200), 'description'], 'picture', 'createdAt', 'updatedAt'],
      where: {
        [Op.or]: [
          {
            title: {
              [Op.substring]: search
            }
          },
          {
            description: {
              [Op.substring]: search
            }
          }
        ]
      },
      order: [
        ['createdAt', 'DESC']
      ],
      limit: limit,
      offset: (page - 1) * limit
    })
    console.log("data",data);

    if (data.length) {
      const count = await News.count({
        where: {
          [Op.or]: [
            {
              title: {
                [Op.substring]: search
              }
            },
            {
              description: {
                [Op.substring]: search
              }
            }
          ]
        }
      })

      pageInfo.count = count
      pageInfo.pages = Math.ceil(count / limit)
      const { pages, currentPage } = pageInfo

      if (currentPage < pages) {
        pageInfo.nextLink = `${APP_IP_ADDRESS}:${APP_PORT}/news?${qs.stringify({ ...req.query, ...{ page: page + 1 } })}`
      }

      if (currentPage > 1) {
        pageInfo.prevLink = `${APP_IP_ADDRESS}:${APP_PORT}/news?${qs.stringify({ ...req.query, ...{ page: page - 1 } })}`
      }

      return responseStandard(res, 'List of news!', { pageInfo, result: data })
    } else {
      return responseStandard(res, 'There is no news!', {}, 404, false)
    }
  },
  getUser: async (req, res) => {
    const { search } = req.query

    if (!search) {
      search = ''
    }
    const result = await Users.findAll({
      where: {
        userName: {
          [Op.substring]: search
            }
      },
      attributes: ['id', 'username','email','picture','createdAt']
    }
    )
    console.log(result);
    if (result.length > 0) {
      return responseStandard(res, `user with userName ${search}`, { result })
    } else {
      return responseStandard(res, `userName ${search} not found`, {}, 401, false)
    }
  },
  viewUserNews: async (req, res) => {
    const { id } = req.params
    let { search } = req.query
    if (!search) {
      search = ''
    }
   
    const count = await News.count({ where: { user_id: id } })
    const page = paging(req, count)
    const { offset, pageInfo } = page
    console.log(offset)
    const { limitData: limit } = pageInfo

    // const user = await Users.findAll({where: {id:id}})
    // console.log('cek', user.userName)
    const result = await News.findAll({
      include: {
        model: Users,
        as: 'Author',
        attributes: ['id', 'userName', 'picture'],
        required: true
      },
      where: {
        user_id: id,
        [Op.or]: [{
          title: {
            [Op.substring]: search
          }
        }],
      
      },
      limit,
      offset
    })
    console.log(result)
    return responseStandard(res, 'List user News', { result, pageInfo })
  },

}

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsImlhdCI6MTYwNTExMDU4OSwiZXhwIjoxNjA1MTk2OTg5fQ.Vzp5IsezyxJSS42Vv79jGzHmGN5bpopkH5hffxE5mkc
