'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SharedExpense extends Model {
    static associate(models) {

      //Association for expense_id
      SharedExpense.belongsTo(models.Expense, { foreignKey: 'expense_id', as: 'Expense', onDelete: 'CASCADE', onUpdate: 'CASCADE'});

      //Association for user_id
      SharedExpense.belongsTo(models.User, { foreignKey: 'user_id', as: 'User', onDelete: 'CASCADE', onUpdate: 'CASCADE'});
      
      //Association for group_id
      SharedExpense.belongsTo(models.Group, { foreignKey: 'group_id', as: 'Group', allowNull: true, onDelete: 'CASCADE', onUpdate: 'CASCADE'});
    }
  };
  SharedExpense.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
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
    tableName: 'SharedExpenses'
  });
  return SharedExpense;
};
