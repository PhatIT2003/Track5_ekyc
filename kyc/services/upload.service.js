const path = require("path");
const fs = require('fs').promises; // <-- Thêm dòng này ở đầu file
const handleSuccess = require("../utils/success.util");
const createError = require("http-errors")

const handleGetOneImage = async (url) => {
   try {
      const filePath = path.join(__dirname, '..', 'uploads', url);

      const stats = await fs.stat(filePath);
      if (stats.isFile()) {
         return filePath
      } else {
         throw createError.NotFound("Image not found")
      }
   } catch (error) {
      throw error
   }
};

const handleDeleteImage = async (url) => {
   try {
      // Đường dẫn chính xác (vì uploads nằm trong src)
      const filePath = path.join(__dirname, '../uploads', url);

      try {
         await fs.unlink(filePath);
         return handleSuccess("Delete file successfully");
      } catch (err) {
         if (err.code === 'ENOENT') {
            // File không tồn tại -> coi như thành công và bỏ qua
            return handleSuccess("File not found, no action needed");
         } else {
            // Lỗi khác không phải do file không tồn tại
            throw createError.InternalServerError("Failed to delete file from disk");
         }
      }
   } catch (error) {
      throw error
   }
};

module.exports = {
   handleDeleteImage, handleGetOneImage
}