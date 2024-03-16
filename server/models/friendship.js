'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Friendship extends Model {
    static associate(models) {
      // define association here

      // Association for User
      Friendship.belongsTo(models.User, { foreignKey: 'requester_id', as: 'Requester', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      Friendship.belongsTo(models.User, { foreignKey: 'addressee_id', as: 'Addressee', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
      // Adding the association for updated_by
      Friendship.belongsTo(models.User, { foreignKey: 'updated_by', as: 'Updater' });
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
    status: DataTypes.ENUM('pending', 'accepted', 'blocked', 'declined', 'unblocked', 'deleted'),
    invitation_token: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    updated_by: DataTypes.INTEGER // Adding the new field
  }, {
    sequelize,
    modelName: 'Friendship',
    timestamps: true,
    tableName: 'Friendships'
  });
  return Friendship;
};
