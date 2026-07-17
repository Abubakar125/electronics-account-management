const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Account = sequelize.define('Account', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    account_number: { type: DataTypes.STRING(25), unique: true, allowNull: false },
    customer_id: { type: DataTypes.INTEGER, allowNull: false },
    product_name: { type: DataTypes.STRING(150), allowNull: false },
    brand: { type: DataTypes.STRING(100) },
    model: { type: DataTypes.STRING(100) },
    total_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    advance: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    remaining: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    monthly_installment: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    duration: { type: DataTypes.INTEGER, allowNull: false, comment: 'Number of months' },
    purchase_date: { type: DataTypes.DATEONLY, allowNull: false },
    due_date: { type: DataTypes.DATEONLY },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'cancelled', 'overdue'),
      defaultValue: 'active',
    },
  }, {
    tableName: 'accounts',
    timestamps: true,
    underscored: true,
  });

  Account.associate = (models) => {
    Account.belongsTo(models.Customer, { foreignKey: 'customer_id', as: 'customer' });
    Account.hasMany(models.Payment, { foreignKey: 'account_id', as: 'payments' });
  };

  return Account;
};
