const axios = require('axios');
require('dotenv').config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function sendMessageToTelegram(text, chatId) {
  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: 'Markdown'
    });
    console.log('✅ Đã gửi tin nhắn Telegram.');
  } catch (error) {
    console.error('❌ Lỗi gửi Telegram:', error.response.data);
  }
}

module.exports = { sendMessageToTelegram };
