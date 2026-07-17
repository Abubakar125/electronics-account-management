const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
const bcrypt = require('bcryptjs');
const { sequelize, User, Customer, Account, Payment, Setting } = require('../../models');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');
    await sequelize.sync({ force: true });
    console.log('Database reset and synchronized.');

    // Admin user
    const password = await bcrypt.hash('admin123', 12);
    await User.create({ username: 'admin', password });
    console.log('✅ Admin user created. Username: admin | Password: admin123');

    // Settings
    await Setting.create({
      id: 1,
      company_name: 'Farhan Electronics',
      phone: '0300-1234567',
      address: 'Main Bazaar, Lahore, Pakistan',
      currency: 'PKR',
      receipt_footer: 'Thank you for your business! Farhan Electronics - Your trusted partner.',
    });
    console.log('✅ Default settings created.');

    // Sample customers
    const customers = await Customer.bulkCreate([
      {
        customer_code: 'CUST-0001',
        name: 'Muhammad Ali',
        father_name: 'Muhammad Akbar',
        cnic: '35201-1234567-1',
        phone1: '0300-1111111',
        phone2: '0321-2222222',
        address: 'House 12, Street 5, Gulberg, Lahore',
        occupation: 'Teacher',
        reference: 'Walk-in',
      },
      {
        customer_code: 'CUST-0002',
        name: 'Fatima Bibi',
        father_name: 'Abdul Rehman',
        cnic: '35202-7654321-2',
        phone1: '0333-3333333',
        address: 'Village Kot Lakhpat, Lahore',
        occupation: 'Housewife',
        reference: 'Muhammad Ali',
      },
      {
        customer_code: 'CUST-0003',
        name: 'Ahmed Hassan',
        father_name: 'Hassan Ali',
        cnic: '35203-1122334-3',
        phone1: '0345-4444444',
        address: 'DHA Phase 5, Lahore',
        occupation: 'Business',
        reference: 'Walk-in',
      },
    ]);
    console.log('✅ Sample customers created.');

    // Sample accounts
    const today = new Date();
    const lastMonth = new Date(today); lastMonth.setMonth(lastMonth.getMonth() - 1);
    const twoMonthsAgo = new Date(today); twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    const accounts = await Account.bulkCreate([
      {
        account_number: 'ACC-2026-00001',
        customer_id: customers[0].id,
        product_name: 'LED TV',
        brand: 'Samsung',
        model: '55 inch 4K',
        total_price: 80000,
        advance: 10000,
        remaining: 55000,
        monthly_installment: 5000,
        duration: 14,
        purchase_date: twoMonthsAgo.toISOString().split('T')[0],
        due_date: today.toISOString().split('T')[0],
        status: 'active',
      },
      {
        account_number: 'ACC-2026-00002',
        customer_id: customers[0].id,
        product_name: 'Refrigerator',
        brand: 'Haier',
        model: 'HRF-246',
        total_price: 45000,
        advance: 5000,
        remaining: 0,
        monthly_installment: 4000,
        duration: 10,
        purchase_date: new Date('2025-08-01').toISOString().split('T')[0],
        due_date: null,
        status: 'completed',
      },
      {
        account_number: 'ACC-2026-00003',
        customer_id: customers[1].id,
        product_name: 'Washing Machine',
        brand: 'Dawlance',
        model: 'DW-6000',
        total_price: 35000,
        advance: 5000,
        remaining: 25000,
        monthly_installment: 2500,
        duration: 12,
        purchase_date: lastMonth.toISOString().split('T')[0],
        due_date: today.toISOString().split('T')[0],
        status: 'active',
      },
      {
        account_number: 'ACC-2026-00004',
        customer_id: customers[2].id,
        product_name: 'Air Conditioner',
        brand: 'Gree',
        model: '1.5 Ton',
        total_price: 95000,
        advance: 20000,
        remaining: 60000,
        monthly_installment: 7500,
        duration: 10,
        purchase_date: lastMonth.toISOString().split('T')[0],
        due_date: today.toISOString().split('T')[0],
        status: 'active',
      },
    ]);
    console.log('✅ Sample accounts created.');

    // Sample payments for account 1
    await Payment.bulkCreate([
      {
        receipt_no: 'RCP-2026-00001',
        account_id: accounts[0].id,
        payment_date: twoMonthsAgo.toISOString().split('T')[0],
        amount: 5000,
        remaining_balance: 65000,
        remarks: 'First installment',
      },
      {
        receipt_no: 'RCP-2026-00002',
        account_id: accounts[0].id,
        payment_date: lastMonth.toISOString().split('T')[0],
        amount: 5000,
        remaining_balance: 60000,
        remarks: 'Second installment',
      },
      {
        receipt_no: 'RCP-2026-00003',
        account_id: accounts[0].id,
        payment_date: today.toISOString().split('T')[0],
        amount: 5000,
        remaining_balance: 55000,
        remarks: 'Third installment',
      },
    ]);

    // Sample payment for account 3
    await Payment.create({
      receipt_no: 'RCP-2026-00004',
      account_id: accounts[2].id,
      payment_date: lastMonth.toISOString().split('T')[0],
      amount: 5000,
      remaining_balance: 25000,
      remarks: 'First installment',
    });

    console.log('✅ Sample payments created.');
    console.log('\n🎉 Database seeded successfully!');
    console.log('Login: admin / admin123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seed();
