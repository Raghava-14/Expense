'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Expense extends Model {
    static associate(models) {
      // Define association here
      Expense.belongsTo(models.User, { foreignKey: 'created_by', as: 'Creator' });
      Expense.belongsTo(models.User, { foreignKey: 'updated_by', as: 'Updater' });
      Expense.belongsTo(models.User, { foreignKey: 'deleted_by', as: 'Deleter' });
      Expense.belongsTo(models.Currency, { foreignKey: 'currency_code' });
      Expense.belongsTo(models.Category, { foreignKey: 'category_id' });
    }
  };
  Expense.init({
    name: DataTypes.STRING,
    amount: DataTypes.DECIMAL(10, 2),
    date: DataTypes.DATE,
    repeats: { type: DataTypes.BOOLEAN, defaultValue: false },
    repeatInterval: {
      type: DataTypes.ENUM,
      values: ['Once', 'weekly', 'biweekly', 'monthly', 'yearly'],
      defaultValue: 'Once'
    },
    nextRepeat: DataTypes.DATE,
    email_reminder: { type: DataTypes.BOOLEAN, defaultValue: false },
    comment_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    currency_code: DataTypes.STRING,
    category_id: DataTypes.INTEGER,
    expense_type: DataTypes.ENUM('personal', 'shared', 'group'),
    receipt: DataTypes.TEXT,
    created_by: DataTypes.INTEGER,
    updated_by: DataTypes.INTEGER,
    deleted_by: DataTypes.INTEGER,
    is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    deleted_at: DataTypes.DATE,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Expense',
    timestamps: true, // Enable Sequelize to use `created_at` and `updated_at`
    paranoid: true, // Enable soft delete, it will use `deleted_at`
  });
  return Expense;
};
