const { Customer, Account, Payment } = require('../models');

async function generateCustomerCode() {
  const last = await Customer.findOne({ order: [['id', 'DESC']] });
  if (!last) return 'CUST-0001';
  const lastNum = parseInt(last.customer_code.replace('CUST-', '')) || 0;
  return `CUST-${String(lastNum + 1).padStart(4, '0')}`;
}

async function generateAccountNumber() {
  const year = new Date().getFullYear();
  const last = await Account.findOne({ order: [['id', 'DESC']] });
  if (!last) return `ACC-${year}-00001`;
  const parts = last.account_number.split('-');
  const lastNum = parseInt(parts[parts.length - 1]) || 0;
  return `ACC-${year}-${String(lastNum + 1).padStart(5, '0')}`;
}

async function generateReceiptNumber() {
  const year = new Date().getFullYear();
  const last = await Payment.findOne({ order: [['id', 'DESC']] });
  if (!last) return `RCP-${year}-00001`;
  const parts = last.receipt_no.split('-');
  const lastNum = parseInt(parts[parts.length - 1]) || 0;
  return `RCP-${year}-${String(lastNum + 1).padStart(5, '0')}`;
}

module.exports = { generateCustomerCode, generateAccountNumber, generateReceiptNumber };
