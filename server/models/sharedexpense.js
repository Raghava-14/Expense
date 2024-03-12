'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SharedExpense extends Model {
    static associate(models) {
      // define association here
      SharedExpense.belongsTo(models.Expense, { foreignKey: 'expense_id', as: 'Expense' });
      SharedExpense.belongsTo(models.User, { foreignKey: 'user_id', as: 'User' });
      SharedExpense.belongsTo(models.Group, { foreignKey: 'group_id', as: 'Group', allowNull: true });
    }
  };
  SharedExpense.init({
    expense_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    split_type: DataTypes.ENUM('equal', 'exact_amount', 'percentage', 'by_shares'),
    paid_amount: DataTypes.DECIMAL(10, 2),
    owed_amount: DataTypes.DECIMAL(10, 2),
    group_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'SharedExpense',
    timestamps: true,
  });
  return SharedExpense;
};
