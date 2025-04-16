function formatCurrency(number) {
  return Number(number).toLocaleString('vi-VN');
}

function formatToday() {
  const now = new Date();
  return `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
}

function formatTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function tagUser(name, id) {
  return `[${name}](tg://user?id=${id})`;
}

module.exports = { formatCurrency, formatToday, formatTime, tagUser };
