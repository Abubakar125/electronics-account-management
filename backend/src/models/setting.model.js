const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Setting = sequelize.define('Setting', {
    id: { type: DataTypes.INTEGER, primaryKey: true, defaultValue: 1 },
    company_name: { type: DataTypes.STRING(200), defaultValue: 'Farhan Electronics' },
    logo: { type: DataTypes.STRING(255) },
    phone: { type: DataTypes.STRING(20) },
    address: { type: DataTypes.TEXT },
    currency: { type: DataTypes.STRING(10), defaultValue: 'PKR' },
    receipt_footer: { type: DataTypes.TEXT },
  }, {
    tableName: 'settings',
    timestamps: false,
  });

  return Setting;
};
