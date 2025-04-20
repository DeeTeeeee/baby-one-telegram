const puppeteer = require('puppeteer');

function parseVietnamCurrency(value = '') {
  if (!value) return 0;

  // Lấy phần đầu tiên chứa số, trước dấu cách hoặc dấu cộng
  const match = value.match(/[\d.,]+/);
  if (!match) return 0;

  const raw = match[0].replace(/[.,]/g, '');
  return parseInt(raw, 10) || 0;
}

function getCurrentTimeFormatted() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year}, ${hours}:${minutes}`;
}

async function crawlGoldPrices() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  try {
    await page.goto('https://www.mihong.vn/vi/gia-vang-trong-nuoc', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    await page.waitForSelector('table');

    const rawData = await page.evaluate(() => {
      const tdList = Array.from(document.querySelectorAll('td'));
      const results = [];
    
      for (let i = 0; i < tdList.length; i++) {
        const td = tdList[i];
        const code = td.classList.contains('gold-code-label') ? td.innerText.trim() : null;
        if (code) {
          const buying = tdList[i + 2]?.innerText.trim() || '';
          const selling = tdList[i + 3]?.innerText.trim() || '';
          const buyChange = tdList[i + 4]?.innerText.trim() || '';
          const sellChange = tdList[i + 5]?.innerText.trim() || '';
    
          results.push({
            code,
            rawBuying: buying,
            rawSelling: selling,
            buyChange,
            sellChange,
          });
        }
      }
    
      return results;
    });
    
    console.log(" rawData", rawData)
    

    const filtered = rawData.filter(item => {
      return (
        item.code &&
        item.rawBuying &&
        item.rawSelling &&
        /^[A-Z0-9]+$/.test(item.code) // chỉ giữ code là chữ in hoa / số
      );
    });

    const formatted = filtered.map(item => ({
      buyingPrice: parseVietnamCurrency(item.rawBuying),
      sellingPrice: parseVietnamCurrency(item.rawSelling),
      code: item.code,
      sellChange: 0,
      sellChangePercent: 0,
      buyChange: 0,
      buyChangePercent: 0,
      dateTime: getCurrentTimeFormatted()
    }));

    console.log('✅ Giá vàng Mihong:', formatted);
    await browser.close();
    return formatted;
  } catch (error) {
    console.error('❌ Lỗi crawl:', error.message);
    await browser.close();
    return [];
  }
}

module.exports = { crawlGoldPrices };