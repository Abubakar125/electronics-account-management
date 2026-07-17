const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Payment = sequelize.define('Payment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    receipt_no: { type: DataTypes.STRING(25), unique: true, allowNull: false },
    account_id: { type: DataTypes.INTEGER, allowNull: false },
    payment_date: { type: DataTypes.DATEONLY, allowNull: false },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    remaining_balance: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    remarks: { type: DataTypes.TEXT },
  }, {
    tableName: 'payments',
    timestamps: true,
    underscored: true,
  });

  Payment.associate = (models) => {
    Payment.belongsTo(models.Account, { foreignKey: 'account_id', as: 'account' });
  };

  return Payment;
};
