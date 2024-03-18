'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    static associate(models) {
      // Association with User
      Group.belongsTo(models.User, { foreignKey: 'created_by', as: 'Creator', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
      
      // Association with GroupMember
      Group.hasMany(models.GroupMember, { foreignKey: 'group_id', as: 'GroupMembers', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

      // Association with SharedExpense
      Group.hasMany(models.SharedExpense, { foreignKey: 'group_id', as: 'SharedExpenses', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    }
  }
  Group.init({
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
    group_type: {
      type: DataTypes.ENUM('Home', 'Couple', 'Friends', 'Vacation', 'Trip', 'Family', 'Other'),
      defaultValue: 'Other'
    },
    info: DataTypes.TEXT,
    invitation_link: {
      type: DataTypes.STRING,
      unique: true// Add unique: true if you decide to enforce uniqueness at the application level
    },
    created_by: DataTypes.INTEGER,
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    deleted_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Group',
    timestamps: true,
    tableName: 'Groups', // Explicitly define the table name for clarity
    paranoid: true
  });
  return Group;
};
