require('dotenv').config();

module.exports = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || 'eims_db',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  dialect: 'mysql',
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
};
