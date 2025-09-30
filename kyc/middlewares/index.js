const errorHandle = require("./error.middleware")
const uploadMiddleware = require("./upload.middleware")
const validate = require('./validate.middleware');
const validateFile = require("./validateFilesExist.middleware")

module.exports = {
   errorHandle,
   uploadMiddleware,
   validate,
   validateFile
}