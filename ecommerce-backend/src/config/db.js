// Database initialisation using Sequelize
const { Sequelize } = require('sequelize');
const { DB_URI } = require('./env');

// Create a new Sequelize instance.  Note: for production use you
// should configure pool settings, logging and dialect-specific
// options in a dedicated configuration file.
const sequelize = new Sequelize(DB_URI, {
  logging: false,
});

module.exports = sequelize;