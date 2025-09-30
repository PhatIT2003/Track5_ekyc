require('dotenv').config()
const express = require("express")
const router = require("./routes")
const handleError = require("./middlewares/error.middleware")
const app = express()
const PORT = process.env.PORT || 8000
require('dotenv').config();
const cors = require('cors');

// Allow all origins (CORS *)
app.use(cors());

// express.json() → dùng khi bạn gửi dữ liệu JSON.
// express.urlencoded() → dùng khi bạn gửi dữ liệu từ form(kiểu truyền thống).
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use('/api', router)

// Middleware xử lý lỗi - đặt ở cuối cùng
app.use(handleError);

// Chạy ứng dụng
app.listen(PORT, () => {
   console.log(`Server running on http://localhost:${PORT}`);
});