const axios = require('axios');
const https = require('https');
const { formatCurrency, formatToday, formatTime, tagUser } = require('../utils/format');
const { sendMessageToTelegram } = require('./telegramSender.service');

const agent = new https.Agent({ rejectUnauthorized: false });

const chatId = -1002672782579;

async function getGoldPrice() {
  try {
    const response = await axios.get('https://www.mihong.vn/api/v1/gold/prices/current', {
      httpsAgent: agent,
    });

    const goldData = response.data.data;
    const nowDate = formatToday();
    const nowTime = formatTime();
    const userTag = tagUser('Navi Tuong', 7856580115);

    let message = `📣 Chị ${userTag} ơi, xem giá vàng nè!\n*📈 Giá vàng ngày ${nowDate} (cập nhật lúc ${nowTime}):*\n`;

    if (Array.isArray(goldData)) {
      goldData.forEach(item => {
        if (item.code === 'SJC' || item.code === '999') {
          message += `\n*${item.code}*\n- Mua: ${formatCurrency(item.buyingPrice)} đ\n- Bán: ${formatCurrency(item.sellingPrice)} đ\n`;
        }
      });
    } else {
      message += 'Không lấy được dữ liệu.';
    }

    await sendMessageToTelegram(message, chatId);
  } catch (error) {
    console.error('❌ Lỗi lấy giá vàng:', error?.response);
    await sendMessageToTelegram(`❌ Lỗi khi lấy giá vàng: ${error.message}`, chatId);
  }
}

module.exports = { getGoldPrice };
