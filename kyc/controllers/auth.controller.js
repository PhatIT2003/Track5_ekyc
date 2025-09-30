const { authService } = require("../services")

const login = async (req, res, next) => {
   try {
      const { userName, password } = req.body
      const result = await authService.handleLogin(userName, password)
      res.status(200).json(result);
   } catch (error) {
      next(error);
   }
}

module.exports = {
   login
}