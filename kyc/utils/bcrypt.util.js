const bcrypt = require('bcrypt');

// Hàm mã hóa mật khẩu
const hashPassword = async (password) => {
   const hashed = await bcrypt.hash(password, 10);
   return hashed;
};

// Hàm so sánh mật khẩu
const comparePassword = async (password, hashedPassword) => {
   const isMatch = await bcrypt.compare(password, hashedPassword);
   return isMatch;
};

module.exports = {
   hashPassword, comparePassword
}