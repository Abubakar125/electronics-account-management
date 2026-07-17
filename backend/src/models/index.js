const { Sequelize } = require('sequelize');
const config = require('../config/database');

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: 'mysql',
    logging: config.logging,
    pool: config.pool,
  }
);

const db = { sequelize, Sequelize };

db.User = require('./user.model')(sequelize);
db.Customer = require('./customer.model')(sequelize);
db.Account = require('./account.model')(sequelize);
db.Payment = require('./payment.model')(sequelize);
db.Setting = require('./setting.model')(sequelize);

Object.keys(db).forEach(modelName => {
  if (db[modelName] && db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
