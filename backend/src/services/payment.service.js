const { Payment, Account, Customer, Setting, sequelize } = require('../models');
const { Op } = require('sequelize');
const { generateReceiptNumber } = require('../utils/codeGenerator');
const { generateReceipt } = require('../utils/pdfGenerator');

class PaymentService {
  async getAll(query = {}) {
    const { account_id, from, to, page = 1, limit = 10 } = query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (account_id) where.account_id = account_id;
    if (from || to) {
      where.payment_date = {};
      if (from) where.payment_date[Op.gte] = from;
      if (to) where.payment_date[Op.lte] = to;
    }

    const { count, rows } = await Payment.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['payment_date', 'DESC'], ['created_at', 'DESC']],
      include: [{
        model: Account,
        as: 'account',
        attributes: ['id', 'account_number', 'product_name'],
        include: [{
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'customer_code'],
        }],
      }],
    });

    return { total: count, page: parseInt(page), limit: parseInt(limit), data: rows };
  }

  async getById(id) {
    const payment = await Payment.findByPk(id, {
      include: [{
        model: Account,
        as: 'account',
        include: [{ model: Customer, as: 'customer' }],
      }],
    });
    if (!payment) throw { status: 404, message: 'Payment not found' };
    return payment;
  }

  async create(data) {
    const account = await Account.findByPk(data.account_id);
    if (!account) throw { status: 404, message: 'Account not found' };
    if (account.status === 'completed') throw { status: 400, message: 'This account is already fully paid' };
    if (account.status === 'cancelled') throw { status: 400, message: 'Cannot add payment to a cancelled account' };

    if (parseFloat(data.amount) > parseFloat(account.remaining)) {
      throw { status: 400, message: `Amount exceeds remaining balance of PKR ${account.remaining}` };
    }

    const receipt_no = await generateReceiptNumber();
    const remaining_balance = Math.max(0, parseFloat(account.remaining) - parseFloat(data.amount));

    const t = await sequelize.transaction();
    try {
      const payment = await Payment.create({
        ...data,
        receipt_no,
        remaining_balance,
      }, { transaction: t });

      const newStatus = remaining_balance <= 0 ? 'completed' : account.status;
      const updateData = { remaining: remaining_balance, status: newStatus };

      if (remaining_balance > 0) {
        const currentDue = new Date(account.due_date || data.payment_date);
        currentDue.setMonth(currentDue.getMonth() + 1);
        updateData.due_date = currentDue.toISOString().split('T')[0];
      }

      await account.update(updateData, { transaction: t });
      await t.commit();

      return payment;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  async generateReceiptPDF(id) {
    const payment = await this.getById(id);
    const settings = await Setting.findByPk(1);
    payment.dataValues.settings = settings?.dataValues || {};
    return generateReceipt(payment.dataValues);
  }
}

module.exports = new PaymentService();
