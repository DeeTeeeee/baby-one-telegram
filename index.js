const axios = require('axios');
const https = require('https');
const cron = require('node-cron');
require('dotenv').config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Tạo agent bỏ qua SSL verify
const agent = new https.Agent({ rejectUnauthorized: false });

// Hàm định dạng số tiền: 10020000 -> 10,020,000
function formatCurrency(number) {
  return Number(number).toLocaleString('vi-VN');
}

function formatToday() {
  const now = new Date();

  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();

  return `${day}/${month}/${year}`;
}

function formatTime() {
  const now = new Date();
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');

  return `${hour}:${minute}`;
}

function tagUser(displayName, telegramId) {
  return `[${displayName}](tg://user?id=${telegramId})`;
}

async function getGoldPrice() {
  try {
    const response = await axios.get('https://www.mihong.vn/api/v1/gold/prices/current', {
      httpsAgent: agent,
    });

    const goldData = response.data.data;
    const nowDate = formatToday();
    const nowTime = formatTime();
    const userTag = tagUser('Navi Tuong', 7856580115);

    let message = `  📣Chị ${userTag} ơi, xem giá vàng nè!\n*📈 Giá vàng ngày ${nowDate} (cập nhật lúc ${nowTime}):*\n`;

    if (Array.isArray(goldData)) {
      goldData.forEach(item => {
        if (item.code === 'SJC' || item.code === '999') {
          message += `\n* ${item.code}*\n- Mua: ${formatCurrency(item.buyingPrice)} đ\n- Bán: ${formatCurrency(item.sellingPrice)} đ\n`;
        }
      });
    } else {
      message += 'Không lấy được dữ liệu.';
    }

    await sendMessageToTelegram(message);
  } catch (error) {
    console.error('Lỗi khi lấy giá vàng:', error.message);
    await sendMessageToTelegram(`❌ Lỗi khi lấy giá vàng: ${error.message}`);
  }
}

async function sendMessageToTelegram(text) {
  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: 'Markdown'
    });
    console.log('✅ Đã gửi tin nhắn tới Telegram.');
  } catch (error) {
    console.error('Lỗi khi gửi Telegram:', error.message);
  }
}

// cron.schedule('*/1 * * * *', () => {
//   console.log('🔔 Đang lấy giá vàng lúc 9h sáng...');
//   getGoldPrice("09:00");
// });

cron.schedule('0 9,14,17 * * *', () => {
  console.log('🔔 Đang lấy giá vàng theo lịch hẹn...');
  getGoldPrice();
}, {
  timezone: "Asia/Ho_Chi_Minh"
});

cron.schedule('15 22 * * *', () => {
  console.log(`[${new Date().toLocaleString()}] 🔔 Lịch 21h15`);
  getGoldPrice();
}, { timezone: 'Asia/Ho_Chi_Minh' });

console.log('🚀 Bot đã chạy');
