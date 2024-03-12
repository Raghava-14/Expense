'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Friendship extends Model {
    static associate(models) {
      // define association here
      Friendship.belongsTo(models.User, { foreignKey: 'requester_id', as: 'requester' });
      Friendship.belongsTo(models.User, { foreignKey: 'addressee_id', as: 'addressee' });
    }
  }
  Friendship.init({
    friendship_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    requester_id: DataTypes.INTEGER,
    addressee_id: DataTypes.INTEGER,
    status: DataTypes.ENUM('pending', 'accepted', 'blocked', 'deleted'),
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Friendship',
    timestamps: false, // Adjust based on your table definition
    tableName: 'Friendships'
  });
  return Friendship;
};
