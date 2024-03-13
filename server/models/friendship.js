'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Friendship extends Model {
    static associate(models) {
      // define association here

      //Association for User
      Friendship.belongsTo(models.User, { foreignKey: 'requester_id', as: 'Requester', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      Friendship.belongsTo(models.User, { foreignKey: 'addressee_id', as: 'Addressee', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
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
    timestamps: true, // Adjust based on your table definition
    tableName: 'Friendships'
  });
  return Friendship;
};
