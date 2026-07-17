const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING(100), unique: true, allowNull: false },
    password: { type: DataTypes.STRING(255), allowNull: false },
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
  });

  return User;
};
