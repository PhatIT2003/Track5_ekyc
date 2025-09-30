const uploadServices = require("../services/upload.service");

const getOneSingleImage = async (req, res, next) => {
   try {
      const { url } = req.params;
      const result = await uploadServices.handleGetOneImage(url)
      res.sendFile(result)
   } catch (error) {
      next(error)
   }
}

module.exports = {
   getOneSingleImage
}

