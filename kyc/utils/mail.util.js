const nodemailer = require("nodemailer");

const sendMail = async ({ email, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject,
      html
    };

    // Sửa thành: truyền trực tiếp object mailOptions
    const result = await transporter.sendMail(mailOptions); 
     // Bỏ wrapper { message }
    return result;
  } catch (error) {
    console.log(error);
  }

};

module.exports = sendMail; // Export hàm