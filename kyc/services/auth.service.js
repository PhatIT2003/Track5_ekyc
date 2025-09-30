const db = require("../models");
const createError = require("http-errors");
const handleSuccess = require("../utils/success.util");
const bcryptHandle = require("../utils/bcrypt.util")
const tokenHandle = require("../utils/token.util")

const handleLogin = async (userName, password) => {
   try {
      const user = await db.User.findOne({ where: { userName } })

      if (!user) {
         throw createError.NotFound('Username or password invalid');
      }

      // compare password
      const isMatchPassword = await bcryptHandle.comparePassword(password, user.password)
      if (!isMatchPassword) {
         throw createError.NotFound('Username or password invalid');
      }

      const payload = {
         id: user.id,
         fullname: user.fullname,
         email: user.email,
      }
      const access_token = tokenHandle.createToken(payload)
      return handleSuccess("User logged in successfully", { access_token: access_token });
   } catch (error) {
      throw error
   }
}

module.exports = {
   handleLogin,
}


