const cron = require('node-cron');
const { getGoldPrice } = require('./services/goldPrice.service');
require('./services/telegramListener.service');

cron.schedule('0 9,14,17 * * *', () => {
  console.log('🔔 Gửi giá vàng 9h/14h/17h');
  getGoldPrice();
}, { timezone: 'Asia/Ho_Chi_Minh' });

cron.schedule('15 22 * * *', () => {
  console.log('🔔 Gửi giá vàng lúc 21h15');
  getGoldPrice();
}, { timezone: 'Asia/Ho_Chi_Minh' });

// cron.schedule('*/1 * * * *', () => {
//   console.log('🔔 Đang lấy giá vàng lúc 9h sáng...');
//   getGoldPrice("09:00");
// });

console.log('🚀 Bot Telegram đang chạy...');
