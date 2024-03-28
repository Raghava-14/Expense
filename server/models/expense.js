'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Expense extends Model {
    static associate(models) {
      // Define association here

      //Association for User
      Expense.belongsTo(models.User, { foreignKey: 'created_by', as: 'Creator' });
      Expense.belongsTo(models.User, { foreignKey: 'updated_by', as: 'Updater' });
      Expense.belongsTo(models.User, { foreignKey: 'deleted_by', as: 'Deleter' });

      //Association for Currency
      Expense.belongsTo(models.Currency, { foreignKey: 'currency_code' });

      //Association for Category
      Expense.belongsTo(models.Category, { foreignKey: 'category_id' });
    }
  };
  Expense.init({
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
    amount: DataTypes.DECIMAL(10, 2),
    date: DataTypes.DATE,
    repeatInterval: {
      type: DataTypes.ENUM,
      values: ['Once', 'weekly', 'biweekly', 'monthly', 'yearly'],
      defaultValue: 'Once'
    },
    nextRepeat: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    comment_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    currency_code: DataTypes.STRING,
    category_id: DataTypes.INTEGER,
    expense_type: {
      type: DataTypes.ENUM('personal', 'shared', 'group', 'settlement'),
      defaultValue: 'personal'
    },
    split_type: DataTypes.ENUM('equal', 'exact_amount', 'percentage', 'by_shares'),
    receipt: DataTypes.TEXT,
    created_by: DataTypes.INTEGER,
    updated_by: DataTypes.INTEGER,
    deleted_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Expense',
    timestamps: true, // Enable Sequelize to use `created_at` and `updated_at`
    paranoid: true, // Enable soft delete, it will use `deleted_at`
    tableName: 'Expenses'
  });
  return Expense;
};
