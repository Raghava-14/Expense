'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GroupMember extends Model {
    static associate(models) {
      // Association with Group
      GroupMember.belongsTo(models.Group, { foreignKey: 'group_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
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
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'GroupMember',
    timestamps: true,
    tableName: 'GroupMembers',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return GroupMember;
};
