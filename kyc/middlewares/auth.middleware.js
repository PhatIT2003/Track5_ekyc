require('dotenv').config()
const createError = require("http-errors")
const jwt = require('jsonwebtoken')
const url = require("url");

const verifyAuth = (req, res, next) => {
   // Các API không cần xác thực
   const white_lists = [
      { path: "/login" },
      { path: "/business", method: "POST" },
      { path: "/confirm-business", method: "POST" },
      { path: "/individual", method: "POST" },
      { path: "/confirm-individual", method: "POST" },
   ];

   // Lấy đường dẫn gốc mà không có query parameters
   const requestPath = url.parse(req.originalUrl).pathname;

   // Kiểm tra nếu request thuộc danh sách API không cần xác thực
   const isWhitelisted = white_lists.some(item => {
      return "/api" + item.path === requestPath && (!item.method || item.method === req.method);
   });

   if (isWhitelisted) {
      return next(); // Bỏ qua xác thực
   }

   // Nếu không kiểm tra thì khi không tồn tại sẽ bị lỗi
   if (req.headers && req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      try {
         req.user = jwt.verify(token, process.env.JWT_SECRET)
         next();
      } catch (error) {
         // Khi token hết hạn hoặc không đúng
         throw createError.Unauthorized("Unauthorized");
      }
   } else {
      // Khi token không tồn tại
      throw createError.Unauthorized("Unauthorized");
   }
}

module.exports = verifyAuth