const jwt = require('jsonwebtoken')

const createToken = (payload) => {
   const access_token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
   })
   return access_token
}

module.exports = {
   createToken
}