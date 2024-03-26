'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Balance extends Model {
    static associate(models) {
      // define association here
      Balance.belongsTo(models.User, { foreignKey: 'user_id', as: 'User' });
      Balance.belongsTo(models.User, { foreignKey: 'peer_user_id', as: 'PeerUser' });
    }
  }
  Balance.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    peer_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    amount_owed: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Balance',
    timestamps: true,
    updatedAt: 'updatedAt',
    createdAt: 'createdAt'
  });
  return Balance;
};
