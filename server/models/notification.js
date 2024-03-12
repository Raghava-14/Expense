'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      // associations can be defined here
      Notification.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  };
  Notification.init({
    user_id: DataTypes.INTEGER,
    type: DataTypes.STRING,
    reference_id: DataTypes.INTEGER,
    detail: DataTypes.TEXT,
    read: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Notification',
  });
  return Notification;
};
