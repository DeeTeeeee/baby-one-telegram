const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const emailUsername = process.env.EMAIL_USERNAME;
const emailPassword = process.env.EMAIL_PASSWORD;

// Cấu hình email - thay thế bằng thông tin thực tế
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  pool: true,
  auth: {
    user: emailUsername, // Tài khoản Gmail
    pass: emailPassword  // App password (không phải mật khẩu Gmail thường)
  }
});

// Hàm gửi email
async function sendEmail(title = "Test", emailList, text, files) {
  const attachments = files.map(file => ({
    filename: path.basename(file),
    path: file
  }));

  const mailOptions = {
    from: emailUsername,
    to: emailList,
    subject: title,
    text,
    attachments
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("info", info)
    // console.log(`📧 Email sent to ${email}: ${info.messageId}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${email}:`, error);
  }
}

module.exports = sendEmail;
