const { Payment, Account, Customer, sequelize } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const { generateReport } = require('../utils/pdfGenerator');
const { generateExcel } = require('../utils/excelGenerator');
const { todayPKT, firstOfMonthPKT, daysFromNowPKT } = require('../utils/date');

class ReportService {
  _getDateRange(period, from, to) {
    if (from && to) return { startDate: new Date(from), endDate: new Date(to) };
    const now = new Date();
    switch (period) {
      case 'daily':
        return {
          startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59),
        };
      case 'weekly': {
        const day = now.getDay();
        const start = new Date(now); start.setDate(now.getDate() - day); start.setHours(0, 0, 0, 0);
        const end = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23, 59, 59);
        return { startDate: start, endDate: end };
      }
      case 'yearly':
        return {
          startDate: new Date(now.getFullYear(), 0, 1),
          endDate: new Date(now.getFullYear(), 11, 31, 23, 59, 59),
        };
      default: // monthly
        return {
          startDate: new Date(now.getFullYear(), now.getMonth(), 1),
          endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
        };
    }
  }

  async getCollection(query = {}) {
    const { period = 'monthly', from, to } = query;
    const { startDate, endDate } = this._getDateRange(period, from, to);

    const payments = await Payment.findAll({
      where: { payment_date: { [Op.between]: [startDate, endDate] } },
      order: [['payment_date', 'DESC']],
      include: [{
        model: Account, as: 'account', attributes: ['account_number', 'product_name'],
        include: [{ model: Customer, as: 'customer', attributes: ['name', 'customer_code', 'phone1'] }],
      }],
    });

    const totalAmount = payments.reduce((s, p) => s + parseFloat(p.amount), 0);
    return { period, startDate, endDate, totalAmount, count: payments.length, data: payments };
  }

  async getOutstanding() {
    const accounts = await Account.findAll({
      where: { status: { [Op.in]: ['active', 'overdue'] } },
      order: [['due_date', 'ASC']],
      include: [{
        model: Customer, as: 'customer',
        attributes: ['id', 'name', 'customer_code', 'phone1', 'phone2'],
      }],
    });
    const totalOutstanding = accounts.reduce((s, a) => s + parseFloat(a.remaining), 0);
    return { totalOutstanding, count: accounts.length, data: accounts };
  }

  async getCompleted(query = {}) {
    const { from, to } = query;
    const where = { status: 'completed' };
    if (from || to) {
      where.updated_at = {};
      if (from) where.updated_at[Op.gte] = new Date(from);
      if (to) where.updated_at[Op.lte] = new Date(to);
    }

    const accounts = await Account.findAll({
      where,
      order: [['updated_at', 'DESC']],
      include: [{
        model: Customer, as: 'customer',
        attributes: ['id', 'name', 'customer_code', 'phone1'],
      }],
    });
    const totalAmount = accounts.reduce((s, a) => s + parseFloat(a.total_price), 0);
    return { totalAmount, count: accounts.length, data: accounts };
  }

  async getDashboardStats() {
    const today = todayPKT();
    const firstOfMonth = firstOfMonthPKT();
    const nextWeek = daysFromNowPKT(7);

    const [
      totalCustomers,
      activeAccounts,
      completedAccounts,
      outstandingRaw,
      todayCollectionRaw,
      monthlyCollectionRaw,
      recentPayments,
      recentCustomers,
      upcomingDue,
      recentCompletedAccounts,
    ] = await Promise.all([
      Customer.count(),
      Account.count({ where: { status: { [Op.in]: ['active', 'overdue'] } } }),
      Account.count({ where: { status: 'completed' } }),
      Account.sum('remaining', { where: { status: { [Op.in]: ['active', 'overdue'] } } }),
      Payment.sum('amount', { where: { payment_date: today } }),
      Payment.sum('amount', { where: { payment_date: { [Op.gte]: firstOfMonth } } }),
      Payment.findAll({
        limit: 5, order: [['created_at', 'DESC']],
        include: [{
          model: Account, as: 'account', attributes: ['account_number', 'product_name'],
          include: [{ model: Customer, as: 'customer', attributes: ['name', 'customer_code'] }],
        }],
      }),
      Customer.findAll({ limit: 5, order: [['created_at', 'DESC']], attributes: ['id', 'name', 'customer_code', 'phone1', 'created_at'] }),
      Account.findAll({
        where: {
          status: { [Op.in]: ['active', 'overdue'] },
          due_date: { [Op.between]: [today, nextWeek] },
        },
        limit: 10, order: [['due_date', 'ASC']],
        include: [{ model: Customer, as: 'customer', attributes: ['id', 'name', 'phone1', 'customer_code'] }],
      }),
      Account.findAll({
        where: { status: 'completed' },
        order: [['updated_at', 'DESC']],
        attributes: ['id', 'account_number', 'product_name', 'total_price', 'updated_at'],
        include: [{ model: Customer, as: 'customer', attributes: ['id', 'name', 'customer_code'] }],
      }),
    ]);

    return {
      totalCustomers,
      activeAccounts,
      completedAccounts,
      outstanding: outstandingRaw || 0,
      todayCollection: todayCollectionRaw || 0,
      monthlyCollection: monthlyCollectionRaw || 0,
      recentPayments,
      recentCustomers,
      upcomingDue,
      recentCompletedAccounts,
    };
  }

  async getCustomerReport() {
    const customers = await Customer.findAll({
      include: [{
        model: Account, as: 'accounts',
        include: [{ model: Payment, as: 'payments', attributes: ['amount'] }],
      }],
      order: [['name', 'ASC']],
    });

    return customers.map(c => {
      const totalAccounts = c.accounts.length;
      const activeAccounts = c.accounts.filter(a => ['active', 'overdue'].includes(a.status)).length;
      const completedAccounts = c.accounts.filter(a => a.status === 'completed').length;
      const totalPaid = c.accounts.reduce((s, a) => s + a.payments.reduce((ps, p) => ps + parseFloat(p.amount), 0), 0);
      const outstanding = c.accounts.reduce((s, a) => s + parseFloat(a.remaining || 0), 0);
      return { id: c.id, customer_code: c.customer_code, name: c.name, phone1: c.phone1, cnic: c.cnic, totalAccounts, activeAccounts, completedAccounts, totalPaid, outstanding };
    });
  }

  async exportCollectionExcel(query) {
    const { data, totalAmount, startDate, endDate } = await this.getCollection(query);
    const columns = [
      { header: 'Receipt No', width: 18 },
      { header: 'Date', width: 14 },
      { header: 'Customer', width: 22 },
      { header: 'Account No', width: 18 },
      { header: 'Product', width: 20 },
      { header: 'Amount (PKR)', width: 16 },
      { header: 'Remarks', width: 24 },
    ];
    const rows = data.map(p => [
      p.receipt_no,
      new Date(p.payment_date).toLocaleDateString('en-PK'),
      p.account?.customer?.name || '-',
      p.account?.account_number || '-',
      p.account?.product_name || '-',
      parseFloat(p.amount).toLocaleString(),
      p.remarks || '-',
    ]);
    return generateExcel('Collection Report', columns, rows);
  }

  async exportOutstandingExcel() {
    const { data, totalOutstanding } = await this.getOutstanding();
    const columns = [
      { header: 'Account No', width: 18 },
      { header: 'Customer', width: 22 },
      { header: 'Phone', width: 16 },
      { header: 'Product', width: 20 },
      { header: 'Total Price', width: 16 },
      { header: 'Remaining', width: 16 },
      { header: 'Monthly', width: 16 },
      { header: 'Due Date', width: 14 },
      { header: 'Status', width: 12 },
    ];
    const rows = data.map(a => [
      a.account_number,
      a.customer?.name || '-',
      a.customer?.phone1 || '-',
      a.product_name,
      parseFloat(a.total_price).toLocaleString(),
      parseFloat(a.remaining).toLocaleString(),
      parseFloat(a.monthly_installment).toLocaleString(),
      a.due_date ? new Date(a.due_date).toLocaleDateString('en-PK') : '-',
      a.status.toUpperCase(),
    ]);
    return generateExcel('Outstanding Report', columns, rows);
  }
}

module.exports = new ReportService();
