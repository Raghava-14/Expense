// In your SharedExpense model file (sharedexpense.js)
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection'); // Assuming you have a connection object

const SharedExpense = sequelize.define('SharedExpense', {
  // Other attributes...
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
  }
});

module.exports = SharedExpense;
