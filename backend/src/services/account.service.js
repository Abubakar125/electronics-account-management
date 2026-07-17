const { Account, Customer, Payment } = require('../models');
const { Op } = require('sequelize');
const { generateAccountNumber } = require('../utils/codeGenerator');

class AccountService {
  async getAll(query = {}) {
    const { search, status, customer_id, page = 1, limit = 10 } = query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (status) where.status = status;
    if (customer_id) where.customer_id = customer_id;
    if (search) {
      where[Op.or] = [
        { account_number: { [Op.like]: `%${search}%` } },
        { product_name: { [Op.like]: `%${search}%` } },
        { brand: { [Op.like]: `%${search}%` } },
        { model: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Account.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
      include: [{
        model: Customer,
        as: 'customer',
        attributes: ['id', 'name', 'customer_code', 'phone1'],
      }],
    });

    return { total: count, page: parseInt(page), limit: parseInt(limit), data: rows };
  }

  async getById(id) {
    const account = await Account.findByPk(id, {
      include: [
        { model: Customer, as: 'customer' },
        {
          model: Payment,
          as: 'payments',
          order: [['payment_date', 'DESC']],
        },
      ],
    });
    if (!account) throw { status: 404, message: 'Account not found' };
    return account;
  }

  async create(data) {
    const customer = await Customer.findByPk(data.customer_id);
    if (!customer) throw { status: 404, message: 'Customer not found' };

    const account_number = await generateAccountNumber();
    const advance = parseFloat(data.advance) || 0;
    const remaining = parseFloat(data.total_price) - advance;

    if (remaining < 0) throw { status: 400, message: 'Advance cannot exceed total price' };

    // Calculate first due date: purchase date + 1 month
    const purchaseDate = new Date(data.purchase_date);
    const dueDate = new Date(purchaseDate);
    dueDate.setMonth(dueDate.getMonth() + 1);

    return await Account.create({
      ...data,
      account_number,
      remaining,
      due_date: data.due_date || dueDate.toISOString().split('T')[0],
      status: 'active',
    });
  }

  async update(id, data) {
    const account = await Account.findByPk(id);
    if (!account) throw { status: 404, message: 'Account not found' };
    await account.update(data);
    return account;
  }

  async delete(id) {
    const account = await Account.findByPk(id);
    if (!account) throw { status: 404, message: 'Account not found' };
    await account.destroy();
  }

  async getPayments(id) {
    const account = await Account.findByPk(id, {
      include: [{
        model: Payment,
        as: 'payments',
        order: [['payment_date', 'DESC']],
      }],
    });
    if (!account) throw { status: 404, message: 'Account not found' };
    return account.payments;
  }

  async markOverdueAccounts() {
    const today = new Date().toISOString().split('T')[0];
    const [count] = await Account.update(
      { status: 'overdue' },
      { where: { status: 'active', due_date: { [Op.lt]: today } } }
    );
    return count;
  }
}

module.exports = new AccountService();
