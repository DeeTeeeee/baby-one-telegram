const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const axios = require('axios');
const sendEmail = require('./emailSender.service');
const TelegramBot = require('node-telegram-bot-api');
const { sleep } = require('../utils/global');
require('dotenv').config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

bot.on('polling_error', (error) => {
  console.log(`[polling_error] ${error.code}: ${error.message}`);
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  // bot.sendMessage(chatId, '📥 Hello');

  // Nếu tag bot
  if (msg.document) {
    // const fileId = msg.document.file_id;

    // const fileInfo = await bot.getFile(fileId);
    // const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${fileInfo.file_path}`;
    // bot.sendMessage(chatId, '📥 Đang xử lý file Excel và gửi email...');
    // await handleExcelFile(fileUrl);
    
    // for (const customerName of customerList) {
    //   await sendEmail(customerName);
    //   await sleep(3000);
    // }
  }
});

const handleGetCustomerFilesMap = () => {
  const sourceDir = "/Users/DeeTee/Downloads/SMALL T 03.2025";
  const resultDir = "/Users/DeeTee/Downloads/RESULT";
  
  // Tạo thư mục result nếu chưa tồn tại
  if (!fs.existsSync(resultDir)) {
    fs.mkdirSync(resultDir);
  }

  // Đọc tất cả file trong thư mục gốc
  const files = fs.readdirSync(sourceDir).filter(file => file.endsWith('.pdf'));
    
  const customerFilesMap = {};
  
  files.forEach(file => {
    const parts = file.split('_');
    const customerName = parts[3]; // phần trước _signed (sau ID)
    const customerDir = path.join(resultDir, customerName);
    const destPath = path.join(customerDir, file);
    // customerList.push(customerName);
    if (!customerFilesMap[customerName]) customerFilesMap[customerName] = [];
    customerFilesMap[customerName].push(destPath);
  });
  return customerFilesMap;
}

function extractEmailsFromRaw(raw) {
  if (!raw) return [];

  return raw
    .split(/[,;]+/) // tách theo dấu , hoặc ;
    .map(email => email.trim()) // loại khoảng trắng
    .filter(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)); // lọc đúng định dạng email
}

async function handleExcelFile(fileUrl) {
  try {
    const customerFilesMap = handleGetCustomerFilesMap();
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const workbook = xlsx.read(response.data, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    for (const row of rows) {
      const customerCode = row['Mã khách']?.toString().trim();
      const emailRaw = row['EMAIL']?.toString().trim();
      const emailList = extractEmailsFromRaw(emailRaw);
      console.log(" emailList", emailList)
      const title = `${customerCode} - PHIẾU KIỂM SOÁT MUA BÁN HOÁ CHẤT - Từ ngày 01/03/2025 đến ngày 31/03/2025`;
      const body = `
        Kính gửi Quý Công Ty,

        CTY Smallfortune, xin gửi chứng từ Phiếu Kiểm Soát Mua Bán Hóa Chất với các thông tin chi tiết như sau:

        Thời gian phát sinh mua bán : Từ 01/03/2025 đến 31/03/2025.

        Anh/chị vui lòng Ký, đóng dấu và gửi trả cho cty chúng tôi 1 bản gốc trước ngày 30/04/2025 theo phương thức sau:

        1. Gửi File scan :
        Vui lòng gửi đến địa chỉ email : thu.smallfortune@gmail.com

        hoặc
        2. Gửi chứng từ bản giấy  :
        Vui lòng gửi Chuyển Phát Nhanh với thông tin người nhận như sau:
        Công ty TNHH MTV Nguyên Vật Liệu Smallfortune
        60 Hòa Bình, Phường 5, Quận 11, Tp HCM
        Người nhận : Mrs. Hoa – 082 533 5481

        Ghi chú : Quý công ty có thể ký chứng từ bằng CHỮ KÝ SỐ.

        THÔNG TIN THAM KHẢO

        Anh/chị tham khảo qui định của BCT về việc này theo link sau:
        https://thuvienphapluat.vn/phap-luat/mua-ban-hoa-chat-co-can-phieu-kiem-soat-mua-ban-hoa-chat-doc-hay-khong-truong-hop-mua-ban-hoa-chat--461122-7654.htmlP
      `;

      if (customerCode && customerFilesMap?.[customerCode]?.length) {
        const files = customerFilesMap[customerCode]
        await sendEmail(title, emailList, body, files);
        await sleep(3000);
      }
    }
  } catch (err) {
    console.error('❌ Lỗi đọc file Excel:', err.message);
  }
}
