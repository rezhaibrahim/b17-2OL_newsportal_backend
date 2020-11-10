/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const responseStandard = require('../helpers/response')
const Joi = require('joi')

const { Users } = require('../models')

module.exports = {
  viewUserProfile: async (req, res) => {
    const { id } = req.user
      console.log(req.user)//ya allah gajelas ini tadi undifined skrg ada
    const user = await Users.findByPk(id)
      
    if (user) {
      return responseStandard(res, 'User has been found!', { result: user })
    } else {
      return responseStandard(res, 'User not found!', {}, 404, false)
    }
  },
}
