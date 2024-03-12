'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    static associate(models) {
      // define association here
    }
  }
  Group.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    group_type: {
      type: DataTypes.ENUM('Home', 'Couple', 'Friends', 'Trip', 'Vacation', 'Other'),
      defaultValue: 'Other'
    },
    info: DataTypes.TEXT,
    invitation_link: DataTypes.STRING, // Ensure uniqueness if needed
    created_by: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Group',
    // Ensure timestamps are handled correctly
    timestamps: true,
    updatedAt: 'updated_at',
    createdAt: 'created_at'
  });
  return Group;
};
