'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GroupMember extends Model {
    static associate(models) {
      // define association here
      GroupMember.belongsTo(models.Group, { foreignKey: 'group_id' });
      GroupMember.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }
  GroupMember.init({
    group_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'GroupMember',
    timestamps: true, // Adjust based on your preference
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return GroupMember;
};
