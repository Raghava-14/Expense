'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {
      // define association here

      //Association for expense_id
      Comment.belongsTo(models.Expense, { foreignKey: 'expense_id', as: 'Expense' });

      //Association for user_id
      Comment.belongsTo(models.User, { foreignKey: 'user_id', as: 'User' });
    }
  };
  Comment.init({
    comment: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    expense_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Comment',
    timestamps: true,
    tableName: 'Comments'
  });
  return Comment;
};