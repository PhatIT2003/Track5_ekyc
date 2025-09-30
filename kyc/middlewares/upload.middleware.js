const multer = require('multer');
const path = require('path');
const fs = require('fs');
const createError = require('http-errors');

function createUpload() {
   const uploadDir = path.join(path.resolve(), 'uploads');

   if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
   }

   const storage = multer.diskStorage({
      destination: function (req, file, cb) {
         cb(null, uploadDir);
      },
      filename: function (req, file, cb) {
         const ext = path.extname(file.originalname);
         cb(null, Date.now() + ext);
      }
   });

   const fileFilter = (req, file, cb) => {
      const allowedTypes = ['.jpg', '.jpeg', '.png', '.webp'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedTypes.includes(ext)) {
         cb(null, true);
      } else {
         cb(createError.Conflict('Only image files are allowed (.jpg, .jpeg, .png, .webp)'));
      }
   };

   return multer({
      storage,
      limits: { fileSize: 10 * 1024 * 1024 }, // 3MB
      fileFilter
   });
}

module.exports = { createUpload };
