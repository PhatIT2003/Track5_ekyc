const fs = require("fs")

const validateFilesExist = (req, res, next) => {
   const requiredFields = ['certification_image', 'front_cccd_image', 'back_cccd_image'];
   const missing = requiredFields.filter(field => !req.files || !req.files[field]);

   if (missing.length > 0) {
      // Xoá các file đã lỡ upload
      if (req.files) {
         Object.values(req.files).flat().forEach((file) => {
            fs.unlink(file.path, (err) => {
               if (err) console.error('Không thể xóa file:', file.path);
            });
         });
      }

      // Trả lỗi
      const errors = {};
      missing.forEach(field => {
         errors[field] = `"${field}" is required`;
      });

      return res.status(400).json({
         success: false,
         errors,
      });
   }

   next();
};

module.exports = validateFilesExist;
