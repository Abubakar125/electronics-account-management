const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Customer = sequelize.define('Customer', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    customer_code: { type: DataTypes.STRING(20), unique: true, allowNull: false },
    name: { type: DataTypes.STRING(150), allowNull: false },
    father_name: { type: DataTypes.STRING(150) },
    cnic: { type: DataTypes.STRING(20), unique: true, allowNull: false },
    phone1: { type: DataTypes.STRING(20), allowNull: false },
    phone2: { type: DataTypes.STRING(20) },
    address: { type: DataTypes.TEXT },
    occupation: { type: DataTypes.STRING(100) },
    ref_name:    { type: DataTypes.STRING(150) },
    ref_phone:   { type: DataTypes.STRING(20) },
    ref_cnic:    { type: DataTypes.STRING(20) },
    ref_address: { type: DataTypes.TEXT },
    photo: { type: DataTypes.STRING(255) },
    cnic_front: { type: DataTypes.STRING(255) },
    cnic_back: { type: DataTypes.STRING(255) },
  }, {
    tableName: 'customers',
    timestamps: true,
    underscored: true,
  });

  Customer.associate = (models) => {
    Customer.hasMany(models.Account, { foreignKey: 'customer_id', as: 'accounts' });
  };

  return Customer;
};
