const { Customer, Account, Payment } = require('../models');
const { Op } = require('sequelize');
const { generateCustomerCode } = require('../utils/codeGenerator');
const path = require('path');

function toTitleCase(str) {
  if (!str) return str;
  return str.trim().replace(/\S+/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function normalizeNames(data) {
  if (data.name)        data.name        = toTitleCase(data.name);
  if (data.father_name) data.father_name = toTitleCase(data.father_name);
  if (data.ref_name)    data.ref_name    = toTitleCase(data.ref_name);
  return data;
}

class CustomerService {
  async getAll(query = {}) {
    const { search, page = 1, limit = 10 } = query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { cnic: { [Op.like]: `%${search}%` } },
        { phone1: { [Op.like]: `%${search}%` } },
        { phone2: { [Op.like]: `%${search}%` } },
        { customer_code: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Customer.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
      include: [{
        model: Account,
        as: 'accounts',
        attributes: ['id', 'account_number', 'status', 'remaining', 'product_name'],
      }],
    });

    return { total: count, page: parseInt(page), limit: parseInt(limit), data: rows };
  }

  async getById(id) {
    const customer = await Customer.findByPk(id, {
      include: [{
        model: Account,
        as: 'accounts',
        include: [{
          model: Payment,
          as: 'payments',
          order: [['payment_date', 'DESC']],
        }],
        order: [['created_at', 'DESC']],
      }],
    });
    if (!customer) throw { status: 404, message: 'Customer not found' };
    return customer;
  }

  async create(data, files = {}) {
    const customer_code = await generateCustomerCode();
    const customerData = normalizeNames({ ...data, customer_code });

    await this._handleFileUploads(customerData, files);
    return await Customer.create(customerData);
  }

  async update(id, data, files = {}) {
    const customer = await this.getById(id);
    await this._handleFileUploads(normalizeNames(data), files);
    await customer.update(data);
    return customer.reload();
  }

  async delete(id) {
    const customer = await this.getById(id);
    await customer.destroy();
  }

  async getTimeline(id) {
    const customer = await Customer.findByPk(id, {
      include: [{
        model: Account,
        as: 'accounts',
        order: [['purchase_date', 'ASC']],
        include: [{
          model: Payment,
          as: 'payments',
          order: [['payment_date', 'ASC'], ['created_at', 'ASC']],
        }],
      }],
    });
    if (!customer) throw { status: 404, message: 'Customer not found' };

    const events = [];

    events.push({
      type: 'customer_created',
      date: customer.created_at,
      sortKey: customer.created_at,
      title: 'Customer Registered',
      description: `Customer account created with code ${customer.customer_code}`,
      icon: 'person_add',
      color: 'blue',
    });

    for (const account of customer.accounts) {
      events.push({
        type: 'account_created',
        date: account.purchase_date,
        sortKey: account.created_at,
        title: `Purchased ${account.product_name}`,
        description: `Account ${account.account_number} opened. Total: PKR ${parseFloat(account.total_price).toLocaleString()}`,
        icon: 'shopping_cart',
        color: 'purple',
      });

      for (const payment of account.payments) {
        events.push({
          type: 'payment_made',
          date: payment.payment_date,
          sortKey: payment.created_at,
          title: `Installment Paid — ${account.product_name}`,
          description: `PKR ${parseFloat(payment.amount).toLocaleString()} paid on ${new Date(payment.payment_date + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}. Receipt: ${payment.receipt_no}. Balance: PKR ${parseFloat(payment.remaining_balance).toLocaleString()}`,
          icon: 'payments',
          color: 'green',
        });
      }

      if (account.status === 'completed') {
        events.push({
          type: 'account_completed',
          date: account.updated_at,
          sortKey: account.updated_at,
          title: 'Account Completed',
          description: `${account.account_number} (${account.product_name}) fully paid`,
          icon: 'check_circle',
          color: 'emerald',
        });
      }
    }

    // Sort by date first; use created_at as tiebreaker for same-day events
    return events.sort((a, b) => {
      const dateDiff = new Date(a.date) - new Date(b.date);
      if (dateDiff !== 0) return dateDiff;
      return new Date(a.sortKey) - new Date(b.sortKey);
    });
  }

  async getSummary(id) {
    const customer = await Customer.findByPk(id, {
      include: [{
        model: Account,
        as: 'accounts',
        include: [{ model: Payment, as: 'payments', attributes: ['amount'] }],
      }],
    });
    if (!customer) throw { status: 404, message: 'Customer not found' };

    const totalAccounts = customer.accounts.length;
    const activeAccounts = customer.accounts.filter(a => ['active', 'overdue'].includes(a.status)).length;
    const completedAccounts = customer.accounts.filter(a => a.status === 'completed').length;
    const outstanding = customer.accounts.reduce((s, a) => s + parseFloat(a.remaining || 0), 0);
    const totalPaid = customer.accounts.reduce(
      (s, a) => s + a.payments.reduce((ps, p) => ps + parseFloat(p.amount || 0), 0),
      0
    );

    return { totalAccounts, activeAccounts, completedAccounts, outstanding, totalPaid };
  }

  async _handleFileUploads(data, files) {
    if (files.photo) {
      const ext = path.extname(files.photo.name);
      const filename = `photo_${Date.now()}${ext}`;
      await files.photo.mv(`src/uploads/customers/${filename}`);
      data.photo = `/uploads/customers/${filename}`;
    }
    if (files.cnic_front) {
      const ext = path.extname(files.cnic_front.name);
      const filename = `cnic_front_${Date.now()}${ext}`;
      await files.cnic_front.mv(`src/uploads/cnic/${filename}`);
      data.cnic_front = `/uploads/cnic/${filename}`;
    }
    if (files.cnic_back) {
      const ext = path.extname(files.cnic_back.name);
      const filename = `cnic_back_${Date.now()}${ext}`;
      await files.cnic_back.mv(`src/uploads/cnic/${filename}`);
      data.cnic_back = `/uploads/cnic/${filename}`;
    }
  }
}

module.exports = new CustomerService();
