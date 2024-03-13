'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Currency extends Model {
    static associate(models) {
      // Define association here
      
      //Association for expenses referencing the currency
      Currency.hasMany(models.Expense, {foreignKey: 'currency_code'});
    }
  }
  Currency.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false 
    },
    code: {
      type: DataTypes.STRING,
      unique: true, // Reflecting the unique constraint
      allowNull: false //code should not be nullable; adjust as necessary
    },
    symbol: {
      type: DataTypes.STRING,
      unique: true, // Reflecting the unique constraint
      allowNull: false 
    }
  }, {
    sequelize,
    modelName: 'Currency',
    timestamps: true, // Enable Sequelize-managed timestamps
    tableName: 'Currencies'
  });
  return Currency;
};