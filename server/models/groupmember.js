'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GroupMember extends Model {
    static associate(models) {
      // Association with Group
      GroupMember.belongsTo(models.Group, { foreignKey: 'group_id', as: 'Group', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      // Association with User
      GroupMember.belongsTo(models.User, { foreignKey: 'user_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    }
  }
  GroupMember.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    group_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    deleted_by: {
      type: DataTypes.INTEGER,
      allowNull: true }
  }, {
    sequelize,
    modelName: 'GroupMember',
    paranoid: true, // Enable paranoid mode for soft deletes
    deletedAt: 'deletedAt', // Use the default 'deletedAt' column for paranoid mode
    timestamps: true,
    tableName: 'GroupMembers'
  });
  return GroupMember;
};
